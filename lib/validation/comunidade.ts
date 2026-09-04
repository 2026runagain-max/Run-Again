import { z } from "zod";

// RF02.1 — legenda opcional, até ~200 caracteres (§10.1 do PRD).
export const publicarEvidenciaSchema = z.object({
  tipoEvidencia: z.enum(["risco", "carga_forma", "aderencia", "insight"], { error: "Tipo de evidência inválido." }),
  chave: z.string().min(1),
  textoEvidencia: z.string().min(1),
  legenda: z
    .string()
    .trim()
    .max(200, "Isso passou de 200 caracteres — resume um pouco.")
    .optional()
    .transform((v) => v || undefined),
});
export type PublicarEvidenciaInput = z.infer<typeof publicarEvidenciaSchema>;

// RF06.1/CA2 — validação mínima de tamanho, sem outra regra de negócio.
export const criarTopicoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "Escreve um título curto pra sua conversa.")
    .max(140, "Isso passou de 140 caracteres — resume um pouco."),
  corpo: z
    .string()
    .trim()
    .min(3, "Escreve o que você quer conversar.")
    .max(2000, "Isso passou de 2000 caracteres — resume um pouco."),
});
export type CriarTopicoInput = z.infer<typeof criarTopicoSchema>;

// RF07.1/CA2 — mesma validação de tamanho de RF06.
export const responderTopicoSchema = z.object({
  topicoId: z.string().uuid("Tópico inválido."),
  corpo: z
    .string()
    .trim()
    .min(1, "Escreve sua resposta.")
    .max(2000, "Isso passou de 2000 caracteres — resume um pouco."),
});
export type ResponderTopicoInput = z.infer<typeof responderTopicoSchema>;

// RF08.1 — motivo opcional, texto livre.
export const reportarConteudoSchema = z
  .object({
    postId: z.string().uuid().optional(),
    respostaId: z.string().uuid().optional(),
    motivo: z
      .string()
      .trim()
      .max(500, "Isso passou de 500 caracteres — resume um pouco.")
      .optional()
      .transform((v) => v || undefined),
  })
  .refine((v) => Boolean(v.postId) !== Boolean(v.respostaId), {
    message: "Alvo da denúncia inválido.",
  });
export type ReportarConteudoInput = z.infer<typeof reportarConteudoSchema>;
