import type {
  CapacidadeRadar,
  CargaVida,
  CondicaoClinica,
  EstagioExercicio,
  FuncaoDiaSeguinte,
  LadoCorpo,
  ZonaResposta,
} from "./types";

// RF-I1: rótulo do corredor é revisado à parte do rótulo interno do
// profissional — nunca reaproveitar um sem revisão de tom (§10.1 do PRD).
export const capacidadeLabelProfissional: Record<CapacidadeRadar, string> = {
  forca: "Força",
  potencia: "Potência",
  resistencia_muscular: "Resistência muscular",
  mobilidade: "Mobilidade",
  estabilidade: "Estabilidade",
  equilibrio: "Equilíbrio / propriocepção",
  capacidade_aerobia: "Capacidade aeróbia",
  controle_motor: "Controle motor",
  amplitude_movimento: "Amplitude de movimento (ADM)",
};

export const capacidadeLabelCorredor: Record<CapacidadeRadar, string> = {
  forca: "Força",
  potencia: "Potência",
  resistencia_muscular: "Resistência",
  mobilidade: "Mobilidade",
  estabilidade: "Estabilidade de tronco",
  equilibrio: "Equilíbrio",
  capacidade_aerobia: "Fôlego",
  controle_motor: "Controle de movimento",
  amplitude_movimento: "Amplitude de movimento",
};

export const ladoLabel: Record<LadoCorpo, string> = {
  esquerdo: "Esquerdo",
  direito: "Direito",
  bilateral: "Bilateral",
};

export const zonaLabel: Record<ZonaResposta, string> = {
  verde: "Dentro do esperado",
  amarela: "Atenção",
  vermelha: "Alerta",
};

export const cargaVidaLabel: Record<CargaVida, string> = {
  tranquila: "Tranquila",
  normal: "Normal",
  carregada: "Carregada",
  muito_carregada: "Muito carregada",
};

export const funcaoDiaSeguinteLabel: Record<FuncaoDiaSeguinte, string> = {
  normal: "Normal, sem limitação",
  levemente_limitada: "Um pouco limitada",
  muito_limitada: "Bem limitada",
};

export const estagioLabel: Record<EstagioExercicio, string> = {
  inicial: "Inicial",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const condicaoLabel: Record<CondicaoClinica, string> = {
  tendinopatia_patelar: "Tendinopatia patelar",
  tendinopatia_aquiles: "Tendinopatia de Aquiles",
  fasciite_plantar: "Fasciíte plantar",
  entorse_tornozelo: "Entorse de tornozelo",
  lesao_isquiotibiais: "Lesão de isquiotibiais",
  sindrome_trato_iliotibial: "Síndrome do trato iliotibial",
  sindrome_dor_femoropatelar: "Síndrome da dor femoropatelar",
  dor_lombar: "Dor lombar",
  outra: "Outra condição",
};

export function estagioPorScore(score: number): EstagioExercicio {
  if (score < 40) return "inicial";
  if (score < 75) return "intermediario";
  return "avancado";
}
