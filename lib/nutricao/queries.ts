import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AvaliacaoNutricionalRow,
  CasoNutricaoComPaciente,
  CasoNutricaoResumoCorredor,
  CasoNutricaoStatus,
  CasoNutricaoTipo,
  ChaveBlocoNutricao,
  CheckinNutricao,
  OrientacaoNutricionalRow,
  RegistroAlimentar,
} from "./types";
import { BLOCO_SCHEMAS_NUTRICAO } from "@/lib/validation/nutricao";
import { CHAVES_BLOCOS_NUTRICAO } from "./types";
import { calcularStatusNutricional, type StatusNutricionalResultado } from "./motor";

export async function getAvaliacaoNutricionalAtual(userId: string): Promise<AvaliacaoNutricionalRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("avaliacoes_nutricionais").select("*").eq("usuario_id", userId).maybeSingle();
  return data as AvaliacaoNutricionalRow | null;
}

/**
 * RF01-CA3/CA2 — primeiro bloco não concluído, respeitando a ramificação do
 * bloco condicional (saúde menstrual só entra quando sexoBiologico ===
 * "feminino", só decidível depois do Bloco Biometria estar salvo). Mesma
 * abordagem de lib/avaliacao/queries.ts.
 */
export function primeiroBlocoIncompletoNutricao(
  avaliacao: AvaliacaoNutricionalRow | null,
): ChaveBlocoNutricao | null {
  const respostas = avaliacao?.respostas ?? {};

  for (const chave of CHAVES_BLOCOS_NUTRICAO) {
    const valor = respostas[chave];
    if (!valor) return chave;
    const schema = BLOCO_SCHEMAS_NUTRICAO[chave];
    const parsed = schema.safeParse(valor);
    if (!parsed.success) return chave;

    // Logo depois do bloco Biometria salvo, decide se o bloco condicional
    // de saúde menstrual entra na sequência (RF01-CA2).
    if (chave === "blocoBiometria" && respostas.blocoBiometria?.sexoBiologico === "feminino") {
      const menstrual = respostas.blocoSaudeMenstrual;
      if (!menstrual) return "blocoSaudeMenstrual";
      const parsedMenstrual = BLOCO_SCHEMAS_NUTRICAO.blocoSaudeMenstrual.safeParse(menstrual);
      if (!parsedMenstrual.success) return "blocoSaudeMenstrual";
    }
  }

  return null;
}

export function avaliacaoNutricionalCompleta(avaliacao: AvaliacaoNutricionalRow | null): boolean {
  return primeiroBlocoIncompletoNutricao(avaliacao) === null;
}

// ---------------------------------------------------------------------------
// Dado já coletado no Fluxo 2 — nunca perguntado de novo (regra §6)
// ---------------------------------------------------------------------------

export interface DadosTreinoFluxo2 {
  persona: string | null;
  frequenciaSemanal: "nao_treino_agora" | "1_2x" | "3_4x" | "5x_mais" | null;
  volumeAtualKm: number | null;
  objetivoPrincipal: string | null;
  provaAlvo: string | null;
}

export async function getDadosTreinoFluxo2(userId: string): Promise<DadosTreinoFluxo2> {
  const supabase = await createClient();
  const [{ data: usuario }, { data: avaliacao }] = await Promise.all([
    supabase.from("usuarios").select("persona").eq("id", userId).single(),
    supabase.from("avaliacoes_iniciais").select("respostas").eq("usuario_id", userId).maybeSingle(),
  ]);

  const respostas = (avaliacao?.respostas ?? {}) as {
    blocoB?: { objetivoPrincipal?: string; provaAlvo?: string };
    blocoC?: { frequenciaSemanal?: DadosTreinoFluxo2["frequenciaSemanal"]; volumeAtualKm?: number };
  };

  return {
    persona: usuario?.persona ?? null,
    frequenciaSemanal: respostas.blocoC?.frequenciaSemanal ?? null,
    volumeAtualKm: respostas.blocoC?.volumeAtualKm ?? null,
    objetivoPrincipal: respostas.blocoB?.objetivoPrincipal ?? null,
    provaAlvo: respostas.blocoB?.provaAlvo ?? null,
  };
}

// ---------------------------------------------------------------------------
// Orientação
// ---------------------------------------------------------------------------

export async function getOrientacaoVigente(userId: string): Promise<OrientacaoNutricionalRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_orientacao_nutricao_vigente")
    .select("*")
    .eq("usuario_id", userId)
    .maybeSingle();
  return data as OrientacaoNutricionalRow | null;
}

export async function getHistoricoOrientacoes(userId: string): Promise<OrientacaoNutricionalRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orientacoes_nutricionais")
    .select("*")
    .eq("usuario_id", userId)
    .order("versao", { ascending: false });
  return (data as OrientacaoNutricionalRow[]) ?? [];
}

export async function getProximaVersaoOrientacao(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orientacoes_nutricionais")
    .select("versao")
    .eq("usuario_id", userId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.versao ?? 0) + 1;
}

// ---------------------------------------------------------------------------
// Registro alimentar (RF07)
// ---------------------------------------------------------------------------

export async function getRegistrosAlimentares(userId: string, limite = 30): Promise<RegistroAlimentar[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registros_alimentares")
    .select("*")
    .eq("usuario_id", userId)
    .order("registrado_em", { ascending: false })
    .limit(limite);
  return (data as RegistroAlimentar[]) ?? [];
}

export async function getContagemRegistrosRecentes(userId: string, desde: Date): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("registros_alimentares")
    .select("id", { count: "exact", head: true })
    .eq("usuario_id", userId)
    .gte("registrado_em", desde.toISOString());
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Check-ins (M10 / RF08)
// ---------------------------------------------------------------------------

export async function getCheckinsRecentes(userId: string, limite = 5): Promise<CheckinNutricao[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkins_nutricao")
    .select("*")
    .eq("usuario_id", userId)
    .order("criado_em", { ascending: false })
    .limit(limite);
  return (data as CheckinNutricao[]) ?? [];
}

// ---------------------------------------------------------------------------
// Casos (RF09/RF10) — lado profissional
// ---------------------------------------------------------------------------

export async function getFilaCasos(tipo: CasoNutricaoTipo, status: CasoNutricaoStatus[]): Promise<CasoNutricaoComPaciente[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("casos_nutricao")
    .select("*, paciente:usuarios!casos_nutricao_usuario_id_fkey(id, nome, persona)")
    .eq("tipo", tipo)
    .in("status", status)
    .order("criado_em", { ascending: true });
  return (data as unknown as CasoNutricaoComPaciente[]) ?? [];
}

export async function getCasoPorId(casoId: string): Promise<CasoNutricaoComPaciente | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("casos_nutricao")
    .select("*, paciente:usuarios!casos_nutricao_usuario_id_fkey(id, nome, persona)")
    .eq("id", casoId)
    .maybeSingle();
  return data as unknown as CasoNutricaoComPaciente | null;
}

/**
 * Uso restrito às server actions do próprio corredor (lib/nutricao/
 * actions.ts), pra checar duplicidade sem depender de select direto na
 * tabela — o corredor não tem policy de select nela (só a view restrita,
 * sem "motivo"/"flags"). Ver public.corredor_tem_caso_aberto na migração.
 */
export async function corredorTemCasoAberto(tipo: CasoNutricaoTipo): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("corredor_tem_caso_aberto", { p_tipo: tipo });
  return data === true;
}

// Corredor — status do próprio caso, sem os campos internos de triagem
// (view restrita, ver migração 0006).
export async function getCasosCorredor(userId: string): Promise<CasoNutricaoResumoCorredor[]> {
  void userId; // filtro já é auth.uid() dentro da view
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_casos_nutricao_corredor")
    .select("*")
    .order("criado_em", { ascending: false });
  return (data as CasoNutricaoResumoCorredor[]) ?? [];
}

export async function contarCasosAbertos(): Promise<{ seguranca: number; revisao: number }> {
  const supabase = await createClient();
  const [seguranca, revisao] = await Promise.all([
    supabase.from("casos_nutricao").select("id", { count: "exact", head: true }).eq("tipo", "seguranca").in("status", ["aberto", "em_atendimento"]),
    supabase.from("casos_nutricao").select("id", { count: "exact", head: true }).eq("tipo", "revisao").in("status", ["aberto", "em_atendimento"]),
  ]);
  return { seguranca: seguranca.count ?? 0, revisao: revisao.count ?? 0 };
}

// ---------------------------------------------------------------------------
// RF11 — Card real de Nutrição Esportiva no dashboard (Fluxo 3)
// ---------------------------------------------------------------------------

export interface ResumoNutricaoDashboard {
  existe: boolean;
  nivel: "n2" | "n3" | "n4" | null;
  ultimaAtualizacaoEm: string | null;
  status: StatusNutricionalResultado | null; // só calculável quando nivel = n3
}

/**
 * RF11-CA1/CA2 — leitura pra substituir o placeholder "em construção" na
 * grade de pilares assim que existir orientação (N3 ou N4). NUTRITION_STATUS
 * (M10) não é uma coluna persistida — é recalculado aqui a partir dos
 * check-ins recentes, mesma função usada em lib/nutricao/actions.ts (fonte
 * única, nunca duplicada).
 */
export async function getResumoNutricaoDashboard(userId: string): Promise<ResumoNutricaoDashboard> {
  const avaliacao = await getAvaliacaoNutricionalAtual(userId);
  if (!avaliacao?.ultimo_nivel_automacao) {
    return { existe: false, nivel: null, ultimaAtualizacaoEm: null, status: null };
  }

  // A mesma decisão de app/corredor/nutricao/minha-orientacao/page.tsx: o
  // que conta é a orientação REALMENTE existir (calculada, ajustada ou
  // definida pela equipe) — não o nível bruto da última triagem. Um caso N4
  // já liberado pela equipe (origem 'definida_pela_equipe') tem números reais
  // pra calcular status; um N4 ainda sem orientação, não.
  const orientacao = await getOrientacaoVigente(userId);
  if (!orientacao) {
    return { existe: true, nivel: avaliacao.ultimo_nivel_automacao, ultimaAtualizacaoEm: avaliacao.ultima_triagem_em, status: null };
  }

  const [checkins, registros7d] = await Promise.all([
    getCheckinsRecentes(userId, 5),
    getContagemRegistrosRecentes(userId, new Date(Date.now() - 7 * 86_400_000)),
  ]);

  const media = (campo: "fome_nivel" | "energia_nivel" | "desconforto_gi") =>
    checkins.length === 0 ? null : checkins.reduce((soma, c) => soma + c[campo], 0) / checkins.length;
  const proporcaoDificil = checkins.length === 0 ? null : checkins.filter((c) => c.adesao_percebida === "dificil_seguir").length / checkins.length;

  const status = calcularStatusNutricional({
    fomeMedia: media("fome_nivel"),
    energiaMedia: media("energia_nivel"),
    giMedia: media("desconforto_gi"),
    proporcaoAdesaoDificil: proporcaoDificil,
    temRegistroAlimentarRecente: registros7d > 0,
  });

  return { existe: true, nivel: avaliacao.ultimo_nivel_automacao, ultimaAtualizacaoEm: orientacao.criado_em, status };
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export async function getPerfilNutricao(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("usuarios").select("corredor_viu_onboarding_nutricao").eq("id", userId).single();
  return { viuOnboarding: data?.corredor_viu_onboarding_nutricao ?? false };
}
