import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AderenciaResumo, ResultadoPainel } from "./types";
import type { Resposta24h } from "@/lib/fisioterapia/types";
import { calcularAderencia } from "./calculo";

export async function getPerfilPainel(
  userId: string,
): Promise<{ viuOnboarding: boolean } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("corredor_viu_onboarding_painel")
    .eq("id", userId)
    .single();

  if (!data) return null;
  return { viuOnboarding: data.corredor_viu_onboarding_painel };
}

// Fonte única do hero (RF03), carga/forma (RF05) e risco (RF06): todo
// resposta_24h do corredor, mais recente primeiro. Uma query, três cards —
// evita repetir o mesmo select três vezes na mesma renderização de página.
export async function getRespostas24hResultado(
  pacienteId: string,
): Promise<ResultadoPainel<Resposta24h[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("respostas_24h")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("criado_em", { ascending: false });

  if (error) return { ok: false };
  return { ok: true, data: (data as Resposta24h[]) ?? [] };
}

// RF04 — aderência da sessão atualmente visível. `null` em `data` é o
// estado vazio legítimo (RF04-CA2: sem sessão prescrita ainda), distinto de
// `ok: false` (erro real de leitura).
export async function getAderenciaResultado(
  pacienteId: string,
): Promise<ResultadoPainel<AderenciaResumo | null>> {
  const supabase = await createClient();

  const { data: sessao, error: erroSessao } = await supabase
    .from("sessoes_prescritas")
    .select("id")
    .eq("paciente_id", pacienteId)
    .eq("visivel_para_corredor", true)
    .order("enviada_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroSessao) return { ok: false };
  if (!sessao) return { ok: true, data: null };

  const { data: exercicios, error: erroExercicios } = await supabase
    .from("sessao_exercicios")
    .select("concluido_pelo_corredor")
    .eq("sessao_id", sessao.id);

  if (erroExercicios) return { ok: false };
  if (!exercicios || exercicios.length === 0) return { ok: true, data: null };

  const concluidos = exercicios.filter((e) => e.concluido_pelo_corredor).length;
  return { ok: true, data: calcularAderencia(concluidos, exercicios.length) };
}
