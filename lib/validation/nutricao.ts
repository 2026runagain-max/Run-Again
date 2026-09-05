import { z } from "zod";

const ERRO_CAMPO = "Escolhe uma opção pra continuar.";

// ---------------------------------------------------------------------------
// Bloco Biometria — base para o motor (M04, BMR/TDEE)
// ---------------------------------------------------------------------------

export const blocoBiometriaSchema = z.object({
  pesoKg: z.coerce.number({ error: "Informe seu peso em kg." }).min(30, "Confere esse número.").max(250, "Confere esse número."),
  alturaCm: z.coerce.number({ error: "Informe sua altura em cm." }).min(120, "Confere esse número.").max(230, "Confere esse número."),
  idade: z.coerce.number({ error: "Informe sua idade." }).int().min(14, "Confere esse número.").max(100, "Confere esse número."),
  sexoBiologico: z.enum(["feminino", "masculino", "prefiro_nao_informar"], { error: ERRO_CAMPO }),
});
export type BlocoBiometriaInput = z.infer<typeof blocoBiometriaSchema>;

// ---------------------------------------------------------------------------
// Bloco Objetivo — WEIGHT_LOSS_ELIGIBILITY nasce aqui (motor.ts)
// ---------------------------------------------------------------------------

export const blocoObjetivoSchema = z.object({
  objetivoNutricional: z.enum(["performance", "saude_geral", "emagrecimento", "ganho_massa"], { error: ERRO_CAMPO }),
});
export type BlocoObjetivoInput = z.infer<typeof blocoObjetivoSchema>;

// ---------------------------------------------------------------------------
// Bloco Alimentar
// ---------------------------------------------------------------------------

export const blocoAlimentarSchema = z.object({
  padraoAlimentar: z.enum(["onivoro", "vegetariano", "vegano", "restricao_medica"], { error: ERRO_CAMPO }),
  alergiasIntolerancias: z.string().trim().max(300).optional(),
  refeicoesPorDia: z.coerce.number({ error: "Informe quantas refeições por dia." }).int().min(1).max(10),
});
export type BlocoAlimentarInput = z.infer<typeof blocoAlimentarSchema>;

// ---------------------------------------------------------------------------
// Bloco Digestivo
// ---------------------------------------------------------------------------

export const blocoDigestivoSchema = z.object({
  desconfortoGiCorrida: z.enum(["nunca", "as_vezes", "frequente"], { error: ERRO_CAMPO }),
});
export type BlocoDigestivoInput = z.infer<typeof blocoDigestivoSchema>;

// ---------------------------------------------------------------------------
// Bloco Suplementos
// ---------------------------------------------------------------------------

export const blocoSuplementosSchema = z.object({
  usaSuplementos: z.enum(["sim", "nao"], { error: ERRO_CAMPO }),
  quaisSuplementos: z.string().trim().max(300).optional(),
});
export type BlocoSuplementosInput = z.infer<typeof blocoSuplementosSchema>;

// ---------------------------------------------------------------------------
// Bloco Comportamento — sensível, precedido da tela de contexto (§7, tela 2)
// ---------------------------------------------------------------------------

export const blocoComportamentoSchema = z.object({
  preocupacaoComPeso: z.coerce.number({ error: "Escolhe um número de 0 a 10." }).int().min(0).max(10),
  historicoRestricaoAlimentar: z.enum(["sim", "nao"], { error: ERRO_CAMPO }),
  comportamentoCompensatorio: z.enum(["sim", "nao"], { error: ERRO_CAMPO }),
});
export type BlocoComportamentoInput = z.infer<typeof blocoComportamentoSchema>;

// ---------------------------------------------------------------------------
// Bloco Saúde Menstrual — condicional (RF01-CA2), mesma sensibilidade
// ---------------------------------------------------------------------------

export const blocoSaudeMenstrualSchema = z.object({
  regularidadeCiclo: z.enum(["regular", "irregular", "ausente_amenorreia", "uso_continuo_sem_ciclo"], { error: ERRO_CAMPO }),
  usaContraceptivoHormonal: z.enum(["sim", "nao"], { error: ERRO_CAMPO }),
});
export type BlocoSaudeMenstrualInput = z.infer<typeof blocoSaudeMenstrualSchema>;

export const BLOCO_SCHEMAS_NUTRICAO = {
  blocoBiometria: blocoBiometriaSchema,
  blocoObjetivo: blocoObjetivoSchema,
  blocoAlimentar: blocoAlimentarSchema,
  blocoDigestivo: blocoDigestivoSchema,
  blocoSuplementos: blocoSuplementosSchema,
  blocoComportamento: blocoComportamentoSchema,
  blocoSaudeMenstrual: blocoSaudeMenstrualSchema,
} as const;

// ---------------------------------------------------------------------------
// Registro alimentar (RF07)
// ---------------------------------------------------------------------------

export const registroAlimentarSchema = z.object({
  fonte: z.enum(["open_food_facts", "manual"], { error: ERRO_CAMPO }),
  nomeAlimento: z.string().trim().min(2, "Dá um nome pro alimento."),
  marca: z.string().trim().max(120).optional(),
  porcaoDescricao: z.string().trim().max(120).optional(),
  refeicao: z.enum(["cafe_da_manha", "almoco", "lanche", "jantar", "pre_treino", "pos_treino", "outra"], { error: ERRO_CAMPO }),
  offCodigo: z.string().trim().max(60).optional(),
});
export type RegistroAlimentarInput = z.infer<typeof registroAlimentarSchema>;

// ---------------------------------------------------------------------------
// Check-in de monitoramento (M10 / RF08)
// ---------------------------------------------------------------------------

const nota0a10 = (mensagem: string) =>
  z.coerce.number({ error: mensagem }).int(mensagem).min(0, mensagem).max(10, mensagem);

export const checkinNutricaoSchema = z.object({
  fomeNivel: nota0a10("Informe seu nível de fome, de 0 a 10."),
  energiaNivel: nota0a10("Informe seu nível de energia, de 0 a 10."),
  desconfortoGi: nota0a10("Informe o desconforto digestivo, de 0 a 10."),
  adesaoPercebida: z.enum(["consegui_seguir", "segui_parcialmente", "dificil_seguir"], { error: ERRO_CAMPO }),
  observacao: z.string().trim().max(280).optional(),
});
export type CheckinNutricaoInput = z.infer<typeof checkinNutricaoSchema>;

// ---------------------------------------------------------------------------
// Ajuste de orientação pela nutricionista (RF09-CA3/RF10-CA3)
// ---------------------------------------------------------------------------

export const ajusteOrientacaoSchema = z.object({
  energiaTreinoLeveKcal: z.coerce.number({ error: "Informe a energia (kcal) em dia de treino leve." }).min(800).max(6000),
  energiaTreinoLongoKcal: z.coerce.number({ error: "Informe a energia (kcal) em dia de treino longo/intenso." }).min(800).max(6000),
  energiaDescansoKcal: z.coerce.number({ error: "Informe a energia (kcal) em dia de descanso." }).min(800).max(6000),
  carboidratoG: z.coerce.number({ error: "Informe o carboidrato (g)." }).min(0).max(1500),
  proteinaG: z.coerce.number({ error: "Informe a proteína (g)." }).min(0).max(400),
  gorduraG: z.coerce.number({ error: "Informe a gordura (g)." }).min(0).max(400),
  explicacao: z.string().trim().min(10, "Escreve uma explicação — ela é exibida ao lado do número, nunca isolado."),
  observacoesInternas: z.string().trim().max(1000).optional(),
});
export type AjusteOrientacaoInput = z.infer<typeof ajusteOrientacaoSchema>;
