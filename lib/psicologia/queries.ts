import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AvaliacaoInicialRow, BandaRisco } from "@/lib/avaliacao/types";
import type { Atendimento } from "@/lib/fisioterapia/types";
import { cargaVidaDoBlocoF, calcularRiscoAtualizado } from "@/lib/painel/calculo";
import { getAderenciaResultado, getRespostas24hResultado } from "@/lib/painel/queries";
import { calcularCadenciaPsicologica, fraseBemEstarPorCheckin } from "./calculo";
import type {
  CadenciaPsicologica,
  CheckinPsicologia,
  FilaAtencaoItem,
  ResumoContinuidadePsicologia,
  SinalCruzadoPsicologia,
} from "./types";

// ---------------------------------------------------------------------------
// Onboarding (§7)
// ---------------------------------------------------------------------------

export async function getPerfilPsicologia(userId: string): Promise<{ viuOnboarding: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("corredor_viu_onboarding_psicologia")
    .eq("id", userId)
    .single();
  return { viuOnboarding: data?.corredor_viu_onboarding_psicologia ?? false };
}

// ---------------------------------------------------------------------------
// Lado corredor — check-ins (RF-1/RF-2/RF-3)
// ---------------------------------------------------------------------------

export async function getCheckinsDoCorredor(userId: string): Promise<CheckinPsicologia[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins_psicologia")
    .select("*")
    .eq("usuario_id", userId)
    .order("criado_em", { ascending: false });
  return (data as CheckinPsicologia[]) ?? [];
}

export async function getUltimoCheckin(userId: string): Promise<CheckinPsicologia | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins_psicologia")
    .select("*")
    .eq("usuario_id", userId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as CheckinPsicologia | null;
}

/**
 * RF-8 — banda de risco geral ATUAL (não a inicial do diagnóstico),
 * reaproveitando calcularRiscoAtualizado, já validado pelo painel de
 * progresso (regra §6 do PRD: "nunca recalculada ou duplicada — sinal de
 * carga de vida entra só como leitura de contexto já existente"). Usada
 * apenas como insumo da cadência automática (RF-8), nunca persistida.
 */
export async function getBandaRiscoAtual(
  userId: string,
  avaliacao: Pick<AvaliacaoInicialRow, "risco_score" | "banda_risco">,
): Promise<BandaRisco | null> {
  if (avaliacao.risco_score === null || !avaliacao.banda_risco) return null;

  const [respostasResultado, aderenciaResultado] = await Promise.all([
    getRespostas24hResultado(userId),
    getAderenciaResultado(userId),
  ]);

  const respostas = respostasResultado.ok ? respostasResultado.data : [];
  const zonasAmarelas = respostas.filter((r) => r.zona === "amarela").length;
  const zonasVermelhas = respostas.filter((r) => r.zona === "vermelha").length;
  const aderenciaPercentual = aderenciaResultado.ok ? (aderenciaResultado.data?.percentual ?? null) : null;

  const risco = calcularRiscoAtualizado({
    scoreInicial: avaliacao.risco_score,
    bandaInicial: avaliacao.banda_risco,
    zonasAmarelas,
    zonasVermelhas,
    aderenciaPercentual,
    temDadoNovo: respostas.length > 0,
  });

  return risco.bandaAtual;
}

/** RF-8 — cadência do check-in individual (usada na tela de check-in e no
 * prontuário). Custo de 2 consultas extras aceitável em escala de 1
 * corredor por vez; a fila (getFilaAtencao, abaixo) usa um proxy mais
 * barato de propósito. */
export async function getCadenciaCorredor(
  userId: string,
  avaliacao: AvaliacaoInicialRow | null,
): Promise<CadenciaPsicologica | null> {
  if (!avaliacao?.concluida_em) return null;

  const [checkins, bandaAtual] = await Promise.all([
    getCheckinsDoCorredor(userId),
    getBandaRiscoAtual(userId, avaliacao),
  ]);

  const checkinsAsc = [...checkins].reverse();
  return calcularCadenciaPsicologica({
    checkinsAsc,
    elegibilidadeDesde: avaliacao.concluida_em,
    bandaRiscoAtual: bandaAtual,
  });
}

/** RF-7 — insumo do card de bem-estar mental do painel. */
export async function getResumoBemEstar(
  userId: string,
  avaliacao: Pick<AvaliacaoInicialRow, "perfil_psicologico_frase"> | null,
): Promise<{ frase: string; ehLeituraInicial: boolean; zona: CheckinPsicologia["zona"] | null }> {
  const ultimo = await getUltimoCheckin(userId);

  if (!ultimo) {
    return {
      frase: avaliacao?.perfil_psicologico_frase ?? "Ainda não há sinal suficiente sobre o lado psicológico do seu retorno.",
      ehLeituraInicial: true,
      zona: null,
    };
  }

  return { frase: fraseBemEstarPorCheckin(ultimo), ehLeituraInicial: false, zona: ultimo.zona };
}

// ---------------------------------------------------------------------------
// Lado profissional — prontuário (RF-5)
// ---------------------------------------------------------------------------

export async function getResumoContinuidade(userId: string): Promise<ResumoContinuidadePsicologia> {
  const checkins = await getCheckinsDoCorredor(userId); // desc

  if (checkins.length === 0) {
    return {
      totalCheckins: 0,
      confiancaPrimeira: null,
      confiancaMaisRecente: null,
      zonaAtual: null,
      temTextoLivreNaoRevisado: false,
    };
  }

  const primeiro = checkins[checkins.length - 1];
  return {
    totalCheckins: checkins.length,
    confiancaPrimeira: primeiro.c1_confianca,
    confiancaMaisRecente: checkins[0].c1_confianca,
    zonaAtual: checkins[0].zona,
    temTextoLivreNaoRevisado: checkins.some((c) => !!c.c4_texto_livre && !c.c4_revisado_em),
  };
}

/**
 * Regra de negócio §6 do PRD: "quando o psicólogo abre o prontuário de um
 * corredor em zona amarela/vermelha, vê o sinal de carga de vida mais
 * recente ao lado" — leitura de contexto já existente, nunca recalculada
 * (mesmo dado que a Fisioterapia já mostra no próprio prontuário).
 */
export async function getCargaVidaAtual(
  userId: string,
  avaliacao: AvaliacaoInicialRow | null,
): Promise<ReturnType<typeof cargaVidaDoBlocoF>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("respostas_24h")
    .select("carga_vida_percebida")
    .eq("paciente_id", userId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.carga_vida_percebida) return data.carga_vida_percebida;
  return cargaVidaDoBlocoF(avaliacao?.respostas.blocoF?.desafioRotina);
}

export async function getAtendimentoAbertoPsicologia(pacienteId: string): Promise<Atendimento | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("especialidade", "psicologia_esporte")
    .eq("status", "em_andamento")
    .maybeSingle();
  return data as Atendimento | null;
}

export async function getAtendimentoPsicologiaPorId(atendimentoId: string): Promise<Atendimento | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("id", atendimentoId)
    .eq("especialidade", "psicologia_esporte")
    .maybeSingle();
  return data as Atendimento | null;
}

export async function getTimelineAtendimentosPsicologia(pacienteId: string): Promise<Atendimento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("especialidade", "psicologia_esporte")
    .order("iniciado_em", { ascending: false });
  return (data as Atendimento[]) ?? [];
}

/**
 * RF-3-CA2 — chamada como efeito colateral direto da renderização do
 * prontuário (mesmo padrão já usado por
 * sincronizarComVolumeDeTreinoAction em lib/nutricao/actions.ts: uma
 * function server-only invocada direto de dentro de um Server Component,
 * sem passar por um form/client action). Passa pela função definer da
 * migração 0007 — nunca um UPDATE direto, que exigiria uma policy de
 * escrita mais ampla do que o necessário.
 */
export async function marcarCheckinsRevisados(pacienteId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("marcar_checkins_psicologia_revisados", { p_usuario_id: pacienteId });
}

// ---------------------------------------------------------------------------
// Lado profissional — fila de atenção (RF-4)
// ---------------------------------------------------------------------------

function severidadeFila(item: Pick<FilaAtencaoItem, "temTextoLivreNaoRevisado" | "zonaAtual" | "cadencia">): number {
  if (item.temTextoLivreNaoRevisado) return 4; // (1) texto livre não revisado
  if (item.zonaAtual === "vermelha") return 3; // (2) zona vermelha
  if (item.zonaAtual === "amarela") return 2; // (3) zona amarela
  if (item.cadencia?.emAtraso) return 1; // (4) atraso em relação à cadência esperada
  return 0; // (5) zona verde / sem sinal
}

function ordenarFila(itens: FilaAtencaoItem[]): FilaAtencaoItem[] {
  return [...itens].sort((a, b) => {
    const diff = severidadeFila(b) - severidadeFila(a);
    if (diff !== 0) return diff;
    // Empate: quem espera há mais tempo (último check-in mais antigo) vai na frente.
    return (a.ultimoCheckinEm ?? "").localeCompare(b.ultimoCheckinEm ?? "");
  });
}

interface CheckinResumoLinha {
  usuario_id: string;
  zona: CheckinPsicologia["zona"];
  c4_texto_livre: string | null;
  c4_revisado_em: string | null;
  criado_em: string;
}

/**
 * RF-4 — fila de atenção do psicólogo. `banda_risco` INICIAL do diagnóstico
 * é usada como proxy do "risco geral" na cadência de cada linha — recalcular
 * a banda ATUAL (calcularRiscoAtualizado) por corredor exigiria 2 consultas
 * extras por linha, custo desproporcional numa lista de até 50 pessoas.
 * getCadenciaCorredor (acima) usa a versão exata pro caso de 1 corredor por
 * vez (tela de check-in, prontuário individual) — ponto de integração
 * explícito se a fila precisar da mesma precisão no futuro.
 */
export async function getFilaAtencao(): Promise<FilaAtencaoItem[]> {
  const supabase = await createClient();

  const { data: avaliacoes } = await supabase
    .from("avaliacoes_iniciais")
    .select("usuario_id, banda_risco, concluida_em, usuario:usuarios!avaliacoes_iniciais_usuario_id_fkey(id, nome, persona)")
    .not("concluida_em", "is", null);

  if (!avaliacoes || avaliacoes.length === 0) return [];

  const ids = avaliacoes.map((a) => a.usuario_id);

  const { data: checkins } = await supabase
    .from("checkins_psicologia")
    .select("usuario_id, zona, c4_texto_livre, c4_revisado_em, criado_em")
    .in("usuario_id", ids)
    .order("criado_em", { ascending: true });

  const porUsuario = new Map<string, CheckinResumoLinha[]>();
  for (const c of (checkins as CheckinResumoLinha[] | null) ?? []) {
    const lista = porUsuario.get(c.usuario_id) ?? [];
    lista.push(c);
    porUsuario.set(c.usuario_id, lista);
  }

  const itens: FilaAtencaoItem[] = avaliacoes.map((a) => {
    const usuario = (
      a as unknown as { usuario: { id: string; nome: string; persona: string | null } | null }
    ).usuario;
    const checkinsAsc = porUsuario.get(a.usuario_id) ?? [];
    const ultimo = checkinsAsc[checkinsAsc.length - 1];

    const cadencia = a.concluida_em
      ? calcularCadenciaPsicologica({
          checkinsAsc: checkinsAsc.map((c) => ({ zona: c.zona, criado_em: c.criado_em })),
          elegibilidadeDesde: a.concluida_em,
          bandaRiscoAtual: a.banda_risco,
        })
      : null;

    return {
      pacienteId: a.usuario_id,
      nome: usuario?.nome ?? "Corredor",
      persona: usuario?.persona ?? null,
      zonaAtual: ultimo?.zona ?? null,
      temTextoLivreNaoRevisado: checkinsAsc.some((c) => !!c.c4_texto_livre && !c.c4_revisado_em),
      ultimoCheckinEm: ultimo?.criado_em ?? null,
      cadencia,
    };
  });

  return ordenarFila(itens);
}

// ---------------------------------------------------------------------------
// Lado profissional (fisioterapia) — sinalização cruzada (RF-6)
// ---------------------------------------------------------------------------

export async function getSinaisCruzadosParaFisioterapia(
  pacienteId: string,
  limite = 3,
): Promise<SinalCruzadoPsicologia[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sinais_psicologia_fisioterapia")
    .select("*")
    .eq("usuario_id", pacienteId)
    .order("criado_em", { ascending: false })
    .limit(limite);
  return (data as SinalCruzadoPsicologia[]) ?? [];
}
