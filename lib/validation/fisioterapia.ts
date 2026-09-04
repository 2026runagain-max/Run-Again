import { z } from "zod";

const nota0a10 = (mensagem: string) =>
  z.coerce.number({ error: mensagem }).int(mensagem).min(0, mensagem).max(10, mensagem);

export const avaliacaoSchema = z.object({
  condicaoPrincipal: z
    .enum([
      "tendinopatia_patelar",
      "tendinopatia_aquiles",
      "fasciite_plantar",
      "entorse_tornozelo",
      "lesao_isquiotibiais",
      "sindrome_trato_iliotibial",
      "sindrome_dor_femoropatelar",
      "dor_lombar",
      "outra",
    ])
    .optional(),
  queixaPrincipal: z.string().trim().min(3, "Descreve a queixa principal em poucas palavras."),
  historicoSubjetivo: z.string().trim().optional(),
  observacoesObjetivas: z.string().trim().optional(),
});
export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;

export const testeSchema = z.object({
  capacidade: z.enum([
    "forca",
    "potencia",
    "resistencia_muscular",
    "mobilidade",
    "estabilidade",
    "equilibrio",
    "capacidade_aerobia",
    "controle_motor",
    "amplitude_movimento",
  ]),
  nome: z.string().trim().min(2, "Dá um nome pro teste (ex.: Força de posterior de coxa)."),
  unidade: z.string().trim().min(1, "Informe a unidade (ex.: kg, repetições, segundos)."),
  lado: z.enum(["esquerdo", "direito", "bilateral"]),
  valor: z.coerce.number({ error: "Informe um valor válido." }).min(0, "O valor não pode ser negativo."),
  metaClinica: z.coerce
    .number({ error: "Informe a meta clínica." })
    .positive("A meta clínica precisa ser maior que zero."),
});
export type TesteInput = z.infer<typeof testeSchema>;

export const exercicioDoseSchema = z.object({
  exercicioId: z.string().uuid(),
  series: z.coerce.number().int().min(1).max(20).optional(),
  repeticoes: z.coerce.number().int().min(1).max(200).optional(),
  cargaOuTempo: z.string().trim().max(60).optional(),
});
export type ExercicioDoseInput = z.infer<typeof exercicioDoseSchema>;

export const resposta24hSchema = z.object({
  dorDurante: nota0a10("Informe a dor durante a sessão, de 0 a 10."),
  esforcoPercebido: nota0a10("Informe o esforço percebido, de 0 a 10."),
  dor24h: nota0a10("Informe a dor 24h depois, de 0 a 10."),
  funcaoDiaSeguinte: z.enum(["normal", "levemente_limitada", "muito_limitada"], {
    error: "Escolhe como você acordou no dia seguinte.",
  }),
  // RF-K1-CA1: nunca obrigatório — ausência não bloqueia o envio.
  cargaVidaPercebida: z
    .enum(["tranquila", "normal", "carregada", "muito_carregada"])
    .optional(),
  cargaVidaObservacao: z.string().trim().max(280).optional(),
});
export type Resposta24hInput = z.infer<typeof resposta24hSchema>;
