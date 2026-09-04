// Tipos do pilar de Prescrição Clínica (Fisioterapia).
// Espelham o schema de supabase/migrations/0002_fisioterapia_prescricao.sql —
// nomes de coluna em snake_case de propósito, mesma convenção de lib/auth/perfil.ts.

import type { Especialidade } from "@/lib/types";

export type AtendimentoStatus = "em_andamento" | "finalizado";

export type CapacidadeRadar =
  | "forca"
  | "potencia"
  | "resistencia_muscular"
  | "mobilidade"
  | "estabilidade"
  | "equilibrio"
  | "capacidade_aerobia"
  | "controle_motor"
  | "amplitude_movimento";

export type LadoCorpo = "esquerdo" | "direito" | "bilateral";
export type ZonaResposta = "verde" | "amarela" | "vermelha";
export type CargaVida = "tranquila" | "normal" | "carregada" | "muito_carregada";
export type FuncaoDiaSeguinte = "normal" | "levemente_limitada" | "muito_limitada";
export type EstagioExercicio = "inicial" | "intermediario" | "avancado";

export type CondicaoClinica =
  | "tendinopatia_patelar"
  | "tendinopatia_aquiles"
  | "fasciite_plantar"
  | "entorse_tornozelo"
  | "lesao_isquiotibiais"
  | "sindrome_trato_iliotibial"
  | "sindrome_dor_femoropatelar"
  | "dor_lombar"
  | "outra";

export interface Atendimento {
  id: string;
  paciente_id: string;
  profissional_id: string;
  status: AtendimentoStatus;
  // 0007_psicologia_esportiva.sql — atendimentos passou a aceitar múltiplas
  // especialidades sobre a mesma espinha genérica (pré-requisito de
  // engenharia do PRD de Psicologia do Esporte, §10.2). Default
  // 'fisioterapia' no banco preserva todo o código deste arquivo.
  especialidade: Especialidade;
  condicao_principal: CondicaoClinica | null;
  queixa_principal: string | null;
  historico_subjetivo: string | null;
  observacoes_objetivas: string | null;
  iniciado_em: string;
  finalizado_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface PerformanceTeste {
  id: string;
  paciente_id: string;
  atendimento_id: string | null;
  capacidade: CapacidadeRadar;
  nome: string;
  unidade: string;
  lado: LadoCorpo;
  valor: number;
  meta_clinica: number;
  medido_em: string;
  criado_por: string;
  criado_em: string;
}

export interface EvolucaoTeste {
  paciente_id: string;
  capacidade: CapacidadeRadar;
  nome: string;
  unidade: string;
  lado: LadoCorpo;
  valor_atual: number;
  meta_clinica: number;
  score: number;
  medido_em_atual: string;
  valor_inicial: number;
  total_medicoes: number;
  evolucao_pct: number | null;
}

export interface AssimetriaTeste {
  paciente_id: string;
  capacidade: CapacidadeRadar;
  nome: string;
  unidade: string;
  valor_esquerdo: number;
  valor_direito: number;
  assimetria_pct: number;
  assimetria_pct_inicial: number | null;
  medido_em_mais_recente: string;
}

export interface RadarCapacidade {
  paciente_id: string;
  capacidade: CapacidadeRadar;
  score: number;
  atualizado_em: string;
  total_testes: number;
}

export interface ExercicioCatalogo {
  id: string;
  nome: string;
  capacidade: CapacidadeRadar;
  condicao: CondicaoClinica | null;
  estagio: EstagioExercicio;
  equipamento: string;
  explicacao_corredor: string;
  criado_em: string;
}

export interface SessaoPrescrita {
  id: string;
  atendimento_id: string;
  paciente_id: string;
  profissional_id: string;
  titulo: string;
  observacoes: string | null;
  visivel_para_corredor: boolean;
  enviada_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface SessaoExercicio {
  id: string;
  sessao_id: string;
  exercicio_id: string;
  series: number | null;
  repeticoes: number | null;
  carga_ou_tempo: string | null;
  ordem: number;
  // RF02 — conclusão por exercício, não por sessão inteira.
  concluido_pelo_corredor: boolean;
  concluido_em: string | null;
  criado_em: string;
}

export interface SessaoExercicioComDetalhe extends SessaoExercicio {
  exercicio: ExercicioCatalogo;
}

export interface Resposta24h {
  id: string;
  sessao_id: string;
  paciente_id: string;
  dor_durante: number;
  esforco_percebido: number;
  dor_24h: number;
  funcao_dia_seguinte: FuncaoDiaSeguinte;
  carga_vida_percebida: CargaVida | null;
  carga_vida_observacao: string | null;
  zona: ZonaResposta;
  criado_em: string;
}

// RF08 — histórico de atendimentos pro corredor. Espelha
// vw_historico_atendimentos_corredor (0005), nunca a tabela atendimentos
// inteira: sem os campos clínicos narrativos (queixa_principal,
// historico_subjetivo, observacoes_objetivas), que continuam privativos do
// profissional (regra §6.9 do PRD de painel).
export interface HistoricoAtendimentoResumo {
  id: string;
  status: AtendimentoStatus;
  condicao_principal: CondicaoClinica | null;
  iniciado_em: string;
  finalizado_em: string | null;
}

export interface PacienteResumo {
  id: string;
  nome: string;
  persona: string | null;
  atendimento_aberto_id: string | null;
  ultimo_atendimento_em: string | null;
}
