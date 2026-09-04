// Tipos do pilar de Nutrição Esportiva.
// Espelham o schema de supabase/migrations/0006_nutricao_esportiva.sql —
// nomes de coluna em snake_case (mesma convenção de lib/fisioterapia/types.ts);
// nomes de campo dentro de "respostas" (jsonb) em camelCase (mesma convenção
// de lib/avaliacao/types.ts).

// ---------------------------------------------------------------------------
// Blocos do questionário (M02) — ver nota de origem em lib/nutricao/copy.ts
// ---------------------------------------------------------------------------

export type SexoBiologico = "feminino" | "masculino" | "prefiro_nao_informar";

export interface BlocoBiometria {
  pesoKg: number;
  alturaCm: number;
  idade: number;
  sexoBiologico: SexoBiologico;
}

export type ObjetivoNutricional = "performance" | "saude_geral" | "emagrecimento" | "ganho_massa";

export interface BlocoObjetivo {
  objetivoNutricional: ObjetivoNutricional;
}

export type PadraoAlimentar = "onivoro" | "vegetariano" | "vegano" | "restricao_medica";

export interface BlocoAlimentar {
  padraoAlimentar: PadraoAlimentar;
  alergiasIntolerancias?: string; // opcional, texto livre
  refeicoesPorDia: number;
}

export type DesconfortoGiCorrida = "nunca" | "as_vezes" | "frequente";

export interface BlocoDigestivo {
  desconfortoGiCorrida: DesconfortoGiCorrida;
}

export interface BlocoSuplementos {
  usaSuplementos: "sim" | "nao";
  quaisSuplementos?: string; // opcional
}

export type HistoricoRestricaoAlimentar = "sim" | "nao";
export type ComportamentoCompensatorio = "sim" | "nao";

export interface BlocoComportamento {
  preocupacaoComPeso: number; // 0-10
  historicoRestricaoAlimentar: HistoricoRestricaoAlimentar;
  comportamentoCompensatorio: ComportamentoCompensatorio;
}

export type RegularidadeCiclo = "regular" | "irregular" | "ausente_amenorreia" | "uso_continuo_sem_ciclo";

export interface BlocoSaudeMenstrual {
  regularidadeCiclo: RegularidadeCiclo;
  usaContraceptivoHormonal: "sim" | "nao";
}

export interface RespostasAvaliacaoNutricao {
  blocoBiometria?: BlocoBiometria;
  blocoObjetivo?: BlocoObjetivo;
  blocoAlimentar?: BlocoAlimentar;
  blocoDigestivo?: BlocoDigestivo;
  blocoSuplementos?: BlocoSuplementos;
  blocoComportamento?: BlocoComportamento;
  blocoSaudeMenstrual?: BlocoSaudeMenstrual;
}

// Ordem fixa de retomada (RF01-CA3). blocoSaudeMenstrual é condicional
// (RF01-CA2 — só quando blocoBiometria.sexoBiologico === "feminino") e por
// isso não entra nesta lista: primeiroBlocoIncompleto() trata sua condição à
// parte, mesma abordagem de blocoACompleto() em lib/avaliacao/queries.ts
// para a ramificação do Bloco A.
export const CHAVES_BLOCOS_NUTRICAO = [
  "blocoBiometria",
  "blocoObjetivo",
  "blocoAlimentar",
  "blocoDigestivo",
  "blocoSuplementos",
  "blocoComportamento",
] as const;
export type ChaveBlocoNutricao = (typeof CHAVES_BLOCOS_NUTRICAO)[number] | "blocoSaudeMenstrual";

export interface AvaliacaoNutricionalRow {
  id: string;
  usuario_id: string;
  respostas: RespostasAvaliacaoNutricao;
  concluida_em: string | null;
  ultimo_nivel_automacao: NivelAutomacaoNutricao | null;
  ultima_triagem_flags: string[];
  ultima_triagem_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

// ---------------------------------------------------------------------------
// Triagem e orientação (M03–M08)
// ---------------------------------------------------------------------------

export type NivelAutomacaoNutricao = "n2" | "n3" | "n4";
export type OrigemOrientacao = "calculada" | "ajustada_pela_equipe" | "definida_pela_equipe";

export interface FlagTriagem {
  chave: string;
  gravidade: "vermelha" | "amarela";
  titulo: string;
  explicacao: string;
}

export type TipoDia = "treino_leve" | "treino_longo_ou_intenso" | "descanso";

export interface EnergiaOrientacao {
  porTipoDia: Record<TipoDia, number>; // kcal/dia
  explicacao: string;
}

export interface MacrosDia {
  carboidratoG: number;
  proteinaG: number;
  gorduraG: number;
}

export interface MacrosOrientacao {
  porTipoDia: Record<TipoDia, MacrosDia>;
  explicacao: string;
}

export interface TimingOrientacao {
  itens: { titulo: string; texto: string }[];
}

export interface HidratacaoOrientacao {
  baseMlDia: number;
  extraPorHoraTreinoMl: number;
  explicacao: string;
}

export interface SuplementacaoOrientacao {
  recomendacoes: { nome: string; motivo: string }[];
  explicacao: string;
}

export interface OrientacaoNutricionalRow {
  id: string;
  usuario_id: string;
  versao: number;
  nivel_automacao: NivelAutomacaoNutricao;
  origem: OrigemOrientacao;
  flags_triagem: string[];
  energia: EnergiaOrientacao | null;
  macros: MacrosOrientacao | null;
  timing: TimingOrientacao | null;
  hidratacao: HidratacaoOrientacao | null;
  suplementacao: SuplementacaoOrientacao | null;
  motor_versao: string;
  ajustado_por: string | null;
  ajustado_em: string | null;
  caso_origem_id: string | null;
  criado_em: string;
}

// ---------------------------------------------------------------------------
// Registro alimentar (RF07)
// ---------------------------------------------------------------------------

export type FonteRegistroAlimentar = "open_food_facts" | "manual";
export type RefeicaoTipo = "cafe_da_manha" | "almoco" | "lanche" | "jantar" | "pre_treino" | "pos_treino" | "outra";

export interface RegistroAlimentar {
  id: string;
  usuario_id: string;
  fonte: FonteRegistroAlimentar;
  nome_alimento: string;
  marca: string | null;
  porcao_descricao: string | null;
  refeicao: RefeicaoTipo;
  off_codigo: string | null;
  registrado_em: string;
  criado_em: string;
}

// ---------------------------------------------------------------------------
// Monitoramento (M10)
// ---------------------------------------------------------------------------

export type AdesaoPercebidaNutricao = "consegui_seguir" | "segui_parcialmente" | "dificil_seguir";
export type NutricaoStatusNivel = "verde" | "amarelo" | "vermelho";

export interface CheckinNutricao {
  id: string;
  usuario_id: string;
  fome_nivel: number;
  energia_nivel: number;
  desconforto_gi: number;
  adesao_percebida: AdesaoPercebidaNutricao;
  observacao: string | null;
  criado_em: string;
}

// ---------------------------------------------------------------------------
// Casos (RF09/RF10)
// ---------------------------------------------------------------------------

export type CasoNutricaoTipo = "seguranca" | "revisao";
export type CasoNutricaoStatus = "aberto" | "em_atendimento" | "resolvido";

export interface CasoNutricao {
  id: string;
  usuario_id: string;
  tipo: CasoNutricaoTipo;
  status: CasoNutricaoStatus;
  motivo: string;
  flags: string[];
  orientacao_id: string | null;
  atendido_por: string | null;
  resolvido_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface CasoNutricaoComPaciente extends CasoNutricao {
  paciente: { id: string; nome: string; persona: string | null };
}

export interface CasoNutricaoResumoCorredor {
  id: string;
  tipo: CasoNutricaoTipo;
  status: CasoNutricaoStatus;
  criado_em: string;
  resolvido_em: string | null;
}
