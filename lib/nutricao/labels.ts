import type {
  AdesaoPercebidaNutricao,
  CasoNutricaoStatus,
  CasoNutricaoTipo,
  ComportamentoCompensatorio,
  DesconfortoGiCorrida,
  HistoricoRestricaoAlimentar,
  NivelAutomacaoNutricao,
  NutricaoStatusNivel,
  ObjetivoNutricional,
  OrigemOrientacao,
  PadraoAlimentar,
  RefeicaoTipo,
  RegularidadeCiclo,
  SexoBiologico,
  TipoDia,
} from "./types";

export const sexoBiologicoLabel: Record<SexoBiologico, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  prefiro_nao_informar: "Prefiro não informar",
};

export const objetivoNutricionalLabel: Record<ObjetivoNutricional, string> = {
  performance: "Melhorar performance",
  saude_geral: "Saúde geral e bem-estar",
  emagrecimento: "Emagrecimento",
  ganho_massa: "Ganho de massa muscular",
};

export const padraoAlimentarLabel: Record<PadraoAlimentar, string> = {
  onivoro: "Onívoro (como de tudo)",
  vegetariano: "Vegetariano",
  vegano: "Vegano",
  restricao_medica: "Tenho uma restrição médica",
};

export const desconfortoGiLabel: Record<DesconfortoGiCorrida, string> = {
  nunca: "Nunca",
  as_vezes: "Às vezes",
  frequente: "Frequentemente",
};

export const historicoRestricaoLabel: Record<HistoricoRestricaoAlimentar, string> = {
  sim: "Sim",
  nao: "Não",
};

export const comportamentoCompensatorioLabel: Record<ComportamentoCompensatorio, string> = {
  sim: "Sim",
  nao: "Não",
};

export const regularidadeCicloLabel: Record<RegularidadeCiclo, string> = {
  regular: "Regular",
  irregular: "Irregular",
  ausente_amenorreia: "Ausente há 3 meses ou mais",
  uso_continuo_sem_ciclo: "Uso contínuo de método que suprime o ciclo",
};

export const refeicaoLabel: Record<RefeicaoTipo, string> = {
  cafe_da_manha: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
  pre_treino: "Pré-treino",
  pos_treino: "Pós-treino",
  outra: "Outra",
};

export const adesaoPercebidaLabel: Record<AdesaoPercebidaNutricao, string> = {
  consegui_seguir: "Consegui seguir bem",
  segui_parcialmente: "Segui em parte",
  dificil_seguir: "Foi difícil seguir",
};

export const nutricaoStatusLabel: Record<NutricaoStatusNivel, string> = {
  verde: "Tranquilo",
  amarelo: "Atenção",
  vermelho: "Alerta",
};

export const origemOrientacaoLabel: Record<OrigemOrientacao, string> = {
  calculada: "Calculada",
  ajustada_pela_equipe: "Ajustada pela equipe",
  definida_pela_equipe: "Definida pela equipe",
};

export const nivelAutomacaoLabel: Record<NivelAutomacaoNutricao, string> = {
  n2: "Dado insuficiente",
  n3: "Calculado automaticamente",
  n4: "Avaliação da equipe",
};

export const tipoDiaLabel: Record<TipoDia, string> = {
  treino_leve: "Dia de treino leve",
  treino_longo_ou_intenso: "Dia de treino longo ou intenso",
  descanso: "Dia de descanso",
};

export const casoTipoLabel: Record<CasoNutricaoTipo, string> = {
  seguranca: "Segurança",
  revisao: "Revisão",
};

export const casoStatusLabel: Record<CasoNutricaoStatus, string> = {
  aberto: "Aberto",
  em_atendimento: "Em atendimento",
  resolvido: "Resolvido",
};
