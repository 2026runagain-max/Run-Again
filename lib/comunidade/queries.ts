import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ResultadoPainel } from "@/lib/painel/types";
import type {
  ElegibilidadeCompartilhar,
  PostComunidade,
  PostFeedComunidade,
  RespostaComunidade,
  TipoEvidenciaComunidade,
  TopicoComunidade,
} from "./types";

// ---------------------------------------------------------------------------
// Onboarding (§7)
// ---------------------------------------------------------------------------

export async function getPerfilComunidade(userId: string): Promise<{ viuOnboarding: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("corredor_viu_onboarding_comunidade")
    .eq("id", userId)
    .single();
  return { viuOnboarding: data?.corredor_viu_onboarding_comunidade ?? false };
}

// ---------------------------------------------------------------------------
// RF01 — flag "já compartilhada" por tipo de evidência
// ---------------------------------------------------------------------------

/**
 * Mapa tipo→chave da última evidência DAQUELE tipo já compartilhada por
 * este corredor. Comparar com a `chave` que lib/comunidade/calculo.ts
 * calcula pro estado atual do card decide se o convite ainda aparece
 * (RF01-CA1: some assim que "aquele card específico for atualizado").
 */
export async function getChavesJaCompartilhadas(userId: string): Promise<Partial<Record<TipoEvidenciaComunidade, string>>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comunidade_evidencias_compartilhadas")
    .select("tipo_evidencia, chave")
    .eq("usuario_id", userId);

  const mapa: Partial<Record<TipoEvidenciaComunidade, string>> = {};
  for (const linha of data ?? []) {
    mapa[linha.tipo_evidencia as TipoEvidenciaComunidade] = linha.chave;
  }
  return mapa;
}

/** Combina elegibilidade computada (calculo.ts) com o que já foi compartilhado. */
export function aindaNaoCompartilhada(
  elegibilidade: ElegibilidadeCompartilhar | null,
  jaCompartilhadas: Partial<Record<TipoEvidenciaComunidade, string>>,
  tipo: TipoEvidenciaComunidade,
): ElegibilidadeCompartilhar | null {
  if (!elegibilidade?.elegivel) return null;
  if (jaCompartilhadas[tipo] === elegibilidade.chave) return null;
  return elegibilidade;
}

// ---------------------------------------------------------------------------
// RF03/RF04 — feed de evidências
// ---------------------------------------------------------------------------

interface ReacaoLinha {
  post_id: string;
  usuario_id: string;
}

async function anexarReacoes<T extends PostComunidade>(posts: T[], viewerId: string): Promise<(T & { totalReacoes: number; euReagi: boolean })[]> {
  if (posts.length === 0) return [];

  const supabase = await createClient();
  const { data: reacoes } = await supabase
    .from("comunidade_reacoes")
    .select("post_id, usuario_id")
    .in(
      "post_id",
      posts.map((p) => p.id),
    );

  const porPost = new Map<string, ReacaoLinha[]>();
  for (const r of (reacoes as ReacaoLinha[] | null) ?? []) {
    const lista = porPost.get(r.post_id) ?? [];
    lista.push(r);
    porPost.set(r.post_id, lista);
  }

  return posts.map((post) => {
    const lista = porPost.get(post.id) ?? [];
    return { ...post, totalReacoes: lista.length, euReagi: lista.some((r) => r.usuario_id === viewerId) };
  });
}

// RF03.1 — cronológico estrito (regra §6 do PRD: nunca order by
// engajamento). Envelope ResultadoPainel (mesmo padrão de
// lib/painel/queries.ts) — §8 do PRD exige texto diferente pra "erro de
// verdade" e "ainda não há nada" (vazio), e um array vazio sozinho não
// distingue os dois casos.
export async function getFeedEvidenciasResultado(
  viewerId: string,
  limite = 100,
): Promise<ResultadoPainel<PostFeedComunidade[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comunidade_posts")
    .select("*")
    .eq("tipo", "evidencia")
    .is("deletado_em", null)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) return { ok: false };
  return { ok: true, data: await anexarReacoes((data as PostComunidade[]) ?? [], viewerId) };
}

// ---------------------------------------------------------------------------
// RF06/RF07 — espaço de conversa
// ---------------------------------------------------------------------------

// RF06/RF07 tratam "tópico" como um espaço à parte do "post" de evidência
// (terminologia distinta o documento inteiro) — o botão de apoio (RF04) só
// existe nos posts de evidência (RF03-CA2 lista explicitamente o que cada
// post de evidência exibe); por isso getEspacoConversa não anexa reação.
export async function getEspacoConversaResultado(
  _viewerId: string,
  limite = 100,
): Promise<ResultadoPainel<TopicoComunidade[]>> {
  const supabase = await createClient();

  const { data: topicos, error } = await supabase
    .from("comunidade_posts")
    .select("*")
    .eq("tipo", "conversa")
    .is("deletado_em", null)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) return { ok: false };

  const lista = (topicos as PostComunidade[]) ?? [];
  if (lista.length === 0) return { ok: true, data: [] };

  const { data: respostas, error: erroRespostas } = await supabase
    .from("comunidade_respostas")
    .select("*")
    .in(
      "topico_id",
      lista.map((t) => t.id),
    )
    .is("deletado_em", null)
    .order("criado_em", { ascending: true });

  if (erroRespostas) return { ok: false };

  const respostasPorTopico = new Map<string, RespostaComunidade[]>();
  for (const r of (respostas as RespostaComunidade[] | null) ?? []) {
    const arr = respostasPorTopico.get(r.topico_id) ?? [];
    arr.push(r);
    respostasPorTopico.set(r.topico_id, arr);
  }

  return { ok: true, data: lista.map((topico) => ({ ...topico, respostas: respostasPorTopico.get(topico.id) ?? [] })) };
}
