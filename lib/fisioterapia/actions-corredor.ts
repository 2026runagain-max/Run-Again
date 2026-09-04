"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resposta24hSchema } from "@/lib/validation/fisioterapia";
import type { SessaoExercicio } from "./types";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO =
  "Não conseguimos carregar sua sessão agora. Não é nada que você fez — tenta de novo em instantes.";

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

export async function marcarOnboardingVistoAction(): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase
      .from("usuarios")
      .update({ corredor_viu_onboarding_prescricao: true })
      .eq("id", userId);

    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/minha-recuperacao");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// RF02 — marcar/desmarcar exercício como concluído. Granularidade de
// exercício, não de sessão (regra §6 do PRD de painel). Passa pela função
// marcar_exercicio_concluido (0005), que já confere que o exercício
// pertence a uma sessão visível deste corredor — nunca um UPDATE direto na
// tabela, que abriria série/repetição/carga pra edição pelo client.
export async function marcarExercicioConcluidoAction(
  sessaoExercicioId: string,
  concluido: boolean,
): Promise<Resultado<SessaoExercicio>> {
  try {
    const { supabase } = await exigirCorredor();
    const { data, error } = await supabase
      .rpc("marcar_exercicio_concluido", {
        p_sessao_exercicio_id: sessaoExercicioId,
        p_concluido: concluido,
      })
      .single();

    if (error || !data) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/minha-recuperacao/sessao");
    revalidatePath("/corredor/painel");
    return { ok: true, data: data as SessaoExercicio };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// RF-H — 4 campos + carga de vida (RF-K, nunca obrigatória, CA1).
export async function registrarResposta24hAction(
  sessaoId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = resposta24hSchema.safeParse({
    dorDurante: formData.get("dorDurante"),
    esforcoPercebido: formData.get("esforcoPercebido"),
    dor24h: formData.get("dor24h"),
    funcaoDiaSeguinte: formData.get("funcaoDiaSeguinte"),
    cargaVidaPercebida: formData.get("cargaVidaPercebida") || undefined,
    cargaVidaObservacao: formData.get("cargaVidaObservacao") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase.from("respostas_24h").insert({
      sessao_id: sessaoId,
      paciente_id: userId,
      dor_durante: parsed.data.dorDurante,
      esforco_percebido: parsed.data.esforcoPercebido,
      dor_24h: parsed.data.dor24h,
      funcao_dia_seguinte: parsed.data.funcaoDiaSeguinte,
      carga_vida_percebida: parsed.data.cargaVidaPercebida ?? null,
      carga_vida_observacao: parsed.data.cargaVidaObservacao || null,
      // zona é recalculada pelo trigger no banco (regra determinística de
      // threshold) — nunca confiamos em zona vinda do client.
      zona: "verde",
    });

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/minha-recuperacao/sessao");
    revalidatePath("/corredor/minha-recuperacao/evolucao");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
