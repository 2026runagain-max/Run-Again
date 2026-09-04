import "server-only";
import { createClient } from "@/lib/supabase/server";
import { CHAVES_BLOCOS, type AvaliacaoInicialRow, type BlocoA, type ChaveBloco, type PerfilAvaliacao } from "./types";
import { blocoACompleto } from "./diagnostico";
import { BLOCO_SCHEMAS } from "@/lib/validation/avaliacao";

export async function getPerfilAvaliacao(userId: string): Promise<PerfilAvaliacao | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("persona, consentimento_saude_versao, consentimento_saude_em")
    .eq("id", userId)
    .single();

  if (!data) return null;
  return {
    persona: data.persona,
    consentimentoSaudeVersao: data.consentimento_saude_versao,
    consentimentoSaudeEm: data.consentimento_saude_em,
  };
}

export async function getAvaliacaoAtual(userId: string): Promise<AvaliacaoInicialRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("avaliacoes_iniciais")
    .select("*")
    .eq("usuario_id", userId)
    .maybeSingle();

  return data as AvaliacaoInicialRow | null;
}

/**
 * RF03-CA2/RF07-CA2 — determina em qual bloco o corredor deve retomar,
 * respeitando a ramificação do Bloco A (RF03-CA1). Blocos são avaliados em
 * ordem fixa; o primeiro incompleto é o ponto de retomada.
 */
export function primeiroBlocoIncompleto(avaliacao: AvaliacaoInicialRow | null): ChaveBloco | null {
  const respostas = avaliacao?.respostas ?? {};

  for (const chave of CHAVES_BLOCOS) {
    const valor = respostas[chave];

    if (chave === "blocoA") {
      if (!blocoACompleto(valor as BlocoA | undefined)) return chave;
      continue;
    }

    if (!valor) return chave;

    const schema = BLOCO_SCHEMAS[chave];
    const parsed = schema.safeParse(valor);
    if (!parsed.success) return chave;
  }

  return null; // todos os blocos completos
}

export function avaliacaoCompleta(avaliacao: AvaliacaoInicialRow | null): boolean {
  return primeiroBlocoIncompleto(avaliacao) === null;
}
