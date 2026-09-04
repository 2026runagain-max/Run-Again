"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkinPsicologiaSchema } from "@/lib/validation/psicologia";
import { fraseSinalCruzado } from "./calculo";
import type { ZonaResposta } from "./types";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO =
  "Não conseguimos registrar agora. O que você escreveu continua aqui — nada foi perdido. Tenta de novo.";

async function exigirCorredor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.papel !== "corredor") {
    throw new Error("Não autorizado.");
  }
  return { supabase, userId: user.id };
}

export async function marcarOnboardingPsicologiaVistoAction(): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase
      .from("usuarios")
      .update({ corredor_viu_onboarding_psicologia: true })
      .eq("id", userId);

    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/psicologia/check-in");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * RF-1/RF-2/RF-3 — grava o check-in (o banco recalcula a zona por trigger,
 * nunca confiando no client) e, quando a zona resultante pede atenção,
 * grava o badge de sinalização cruzada pra Fisioterapia (RF-6) na mesma
 * ação — mesmo padrão de orquestração em sequência já usado em
 * lib/nutricao/actions.ts (concluirAvaliacaoNutricionalAction).
 */
export async function registrarCheckinPsicologiaAction(
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado<{ zona: ZonaResposta; quisConversar: boolean; houveCheckinAnterior: boolean }>> {
  const parsed = checkinPsicologiaSchema.safeParse({
    c1Confianca: formData.get("c1Confianca"),
    c2Medo: formData.get("c2Medo"),
    c3Disposicao: formData.get("c3Disposicao") || undefined,
    c4TextoLivre: formData.get("c4TextoLivre") || undefined,
    c5QuerConversar: formData.get("c5QuerConversar") ?? "nao",
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirCorredor();

    // Check-in anterior — usado só pra montar a frase do badge (RF-6); a
    // zona em si é recalculada de novo, de forma independente, dentro do
    // trigger do banco (fonte única de verdade).
    const { data: anterior } = await supabase
      .from("checkins_psicologia")
      .select("c1_confianca")
      .eq("usuario_id", userId)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    const quisConversar = parsed.data.c5QuerConversar === "sim";

    const { data: novo, error } = await supabase
      .from("checkins_psicologia")
      .insert({
        usuario_id: userId,
        c1_confianca: parsed.data.c1Confianca,
        c2_medo: parsed.data.c2Medo,
        c3_disposicao: parsed.data.c3Disposicao ?? null,
        c4_texto_livre: parsed.data.c4TextoLivre || null,
        c5_quer_conversar: quisConversar,
        // zona é recalculada pelo trigger no banco (regra determinística de
        // threshold, RF-2) — nunca confiamos em zona vinda do client, mesmo
        // padrão de registrarResposta24hAction (Fisioterapia).
        zona: "verde",
      })
      .select("id, zona")
      .single();

    if (error || !novo) return { ok: false, erro: ERRO_GENERICO };

    const zona = novo.zona as ZonaResposta;

    // RF-6 — badge de sinalização cruzada: automático, sem intervenção
    // humana, só quando a zona pede atenção (aviso de contexto, nunca
    // ajuste de sessão — RF-6-CA2).
    if (zona !== "verde") {
      const frase = fraseSinalCruzado({
        zona,
        c1Atual: parsed.data.c1Confianca,
        c1Anterior: anterior?.c1_confianca ?? null,
        quisConversar,
      });

      await supabase.from("sinais_psicologia_fisioterapia").insert({
        usuario_id: userId,
        checkin_id: novo.id,
        zona,
        frase,
      });
    }

    revalidatePath("/corredor/psicologia/check-in");
    revalidatePath("/corredor/painel");
    return { ok: true, data: { zona, quisConversar, houveCheckinAnterior: !!anterior } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
