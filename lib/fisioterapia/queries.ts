import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Atendimento,
  AssimetriaTeste,
  CapacidadeRadar,
  EstagioExercicio,
  EvolucaoTeste,
  ExercicioCatalogo,
  HistoricoAtendimentoResumo,
  PacienteResumo,
  RadarCapacidade,
  Resposta24h,
  SessaoExercicioComDetalhe,
  SessaoPrescrita,
} from "./types";

// ---------------------------------------------------------------------------
// Lado profissional
// ---------------------------------------------------------------------------

export async function buscarPacientes(termo: string): Promise<PacienteResumo[]> {
  const supabase = await createClient();
  let query = supabase
    .from("usuarios")
    .select("id, nome, persona")
    .eq("papel", "corredor")
    .order("nome")
    .limit(30);

  if (termo.trim()) {
    query = query.ilike("nome", `%${termo.trim()}%`);
  }

  const { data: pacientes, error } = await query;
  if (error || !pacientes) return [];

  const ids = pacientes.map((p) => p.id);
  if (ids.length === 0) return [];

  const { data: atendimentos } = await supabase
    .from("atendimentos")
    .select("paciente_id, status, iniciado_em")
    .in("paciente_id", ids)
    .order("iniciado_em", { ascending: false });

  const abertoPorPaciente = new Map<string, string>();
  const ultimoPorPaciente = new Map<string, string>();
  for (const a of atendimentos ?? []) {
    if (!ultimoPorPaciente.has(a.paciente_id)) ultimoPorPaciente.set(a.paciente_id, a.iniciado_em);
    if (a.status === "em_andamento" && !abertoPorPaciente.has(a.paciente_id)) {
      abertoPorPaciente.set(a.paciente_id, a.iniciado_em);
    }
  }

  // Query separada busca o id do atendimento aberto (a primeira só tinha status/data).
  const { data: abertos } = await supabase
    .from("atendimentos")
    .select("id, paciente_id")
    .in("paciente_id", ids)
    .eq("status", "em_andamento");

  const idAbertoPorPaciente = new Map<string, string>();
  for (const a of abertos ?? []) idAbertoPorPaciente.set(a.paciente_id, a.id);

  return pacientes.map((p) => ({
    id: p.id,
    nome: p.nome,
    persona: p.persona,
    atendimento_aberto_id: idAbertoPorPaciente.get(p.id) ?? null,
    ultimo_atendimento_em: ultimoPorPaciente.get(p.id) ?? null,
  }));
}

export async function getPacienteBasico(pacienteId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("id, nome, persona")
    .eq("id", pacienteId)
    .single();
  return data;
}

export async function getAtendimentoAberto(pacienteId: string): Promise<Atendimento | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("status", "em_andamento")
    .maybeSingle();
  return data as Atendimento | null;
}

export async function getAtendimentoPorId(atendimentoId: string): Promise<Atendimento | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("id", atendimentoId)
    .maybeSingle();
  return data as Atendimento | null;
}

export async function getTimelineAtendimentos(pacienteId: string): Promise<Atendimento[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atendimentos")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("iniciado_em", { ascending: false });
  return (data as Atendimento[]) ?? [];
}

export async function getRadar(pacienteId: string): Promise<RadarCapacidade[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_radar_capacidades")
    .select("*")
    .eq("paciente_id", pacienteId);
  return (data as RadarCapacidade[]) ?? [];
}

export async function getEvolucoes(pacienteId: string): Promise<EvolucaoTeste[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_evolucao_testes")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("capacidade");
  return (data as EvolucaoTeste[]) ?? [];
}

export async function getAssimetrias(pacienteId: string): Promise<AssimetriaTeste[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_assimetria_testes")
    .select("*")
    .eq("paciente_id", pacienteId);
  return (data as AssimetriaTeste[]) ?? [];
}

export async function getCatalogo(filtro?: {
  capacidade?: CapacidadeRadar;
  estagio?: EstagioExercicio;
}): Promise<ExercicioCatalogo[]> {
  const supabase = await createClient();
  let query = supabase.from("exercicios_catalogo").select("*").order("nome");
  if (filtro?.capacidade) query = query.eq("capacidade", filtro.capacidade);
  if (filtro?.estagio) query = query.eq("estagio", filtro.estagio);
  const { data } = await query;
  return (data as ExercicioCatalogo[]) ?? [];
}

export async function getSessoesDoAtendimento(atendimentoId: string): Promise<SessaoPrescrita[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessoes_prescritas")
    .select("*")
    .eq("atendimento_id", atendimentoId)
    .order("criado_em", { ascending: false });
  return (data as SessaoPrescrita[]) ?? [];
}

export async function getSessaoPorId(sessaoId: string): Promise<SessaoPrescrita | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessoes_prescritas")
    .select("*")
    .eq("id", sessaoId)
    .maybeSingle();
  return data as SessaoPrescrita | null;
}

export async function getExerciciosDaSessao(
  sessaoId: string,
): Promise<SessaoExercicioComDetalhe[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessao_exercicios")
    .select("*, exercicio:exercicios_catalogo(*)")
    .eq("sessao_id", sessaoId)
    .order("ordem");
  return (data as unknown as SessaoExercicioComDetalhe[]) ?? [];
}

export async function getRespostas24hDoPaciente(pacienteId: string): Promise<Resposta24h[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("respostas_24h")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("criado_em", { ascending: false });
  return (data as Resposta24h[]) ?? [];
}

// ---------------------------------------------------------------------------
// Lado corredor
// ---------------------------------------------------------------------------

export async function getSessaoVisivelMaisRecente(
  pacienteId: string,
): Promise<SessaoPrescrita | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessoes_prescritas")
    .select("*")
    .eq("paciente_id", pacienteId)
    .eq("visivel_para_corredor", true)
    .order("enviada_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as SessaoPrescrita | null;
}

export async function getRespostaMaisRecenteDaSessao(sessaoId: string): Promise<Resposta24h | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("respostas_24h")
    .select("*")
    .eq("sessao_id", sessaoId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Resposta24h | null;
}

export async function getPerfilCorredorPrescricao() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("corredor_viu_onboarding_prescricao")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    viuOnboarding: data?.corredor_viu_onboarding_prescricao ?? false,
  };
}

// RF08 — lê por vw_historico_atendimentos_corredor (0005), nunca por
// "atendimentos" direto: a view é o mecanismo de restrição de coluna (regra
// §6.9 do PRD de painel), a tabela em si não tem mais policy de select pro
// corredor. O parâmetro pacienteId é redundante com o filtro auth.uid() da
// view (mantido pela mesma assinatura de função de antes desta migração —
// nunca usado pra decidir de quem é o dado, só documenta a intenção).
export async function getHistoricoAtendimentosCorredor(
  pacienteId: string,
): Promise<HistoricoAtendimentoResumo[]> {
  void pacienteId;
  const supabase = await createClient();
  const { data } = await supabase
    .from("vw_historico_atendimentos_corredor")
    .select("*")
    .eq("status", "finalizado")
    .order("finalizado_em", { ascending: false });
  return (data as HistoricoAtendimentoResumo[]) ?? [];
}

// Mesma leitura, mas propagando erro real do Supabase — usada pelo painel
// (RF08 + §8 estado de erro), que precisa distinguir "sem atendimento ainda"
// de "não conseguimos carregar isso agora" (a versão acima, reaproveitada
// pela tela de histórico dedicada, trata as duas a mesma forma há mais
// tempo — não vale o risco de mudar seu contrato agora).
export async function getHistoricoAtendimentosCorredorResultado(): Promise<
  { ok: true; data: HistoricoAtendimentoResumo[] } | { ok: false }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vw_historico_atendimentos_corredor")
    .select("*")
    .eq("status", "finalizado")
    .order("finalizado_em", { ascending: false })
    .limit(5);

  if (error) return { ok: false };
  return { ok: true, data: (data as HistoricoAtendimentoResumo[]) ?? [] };
}
