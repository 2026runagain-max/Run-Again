import { z } from "zod";

// Item 14 (feedback da Marina) — edição de informações básicas do perfil.
// Instagram/Strava são só texto livre (o próprio @ ou link, do jeito que a
// pessoa quiser colar) — nesta fase não há integração de API com nenhuma
// das duas plataformas, só guardar e exibir o que foi digitado.
export const editarPerfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Escreve seu nome completo.")
    .max(120, "Isso passou de 120 caracteres — resume um pouco."),
  instagram: z
    .string()
    .trim()
    .max(120, "Isso passou de 120 caracteres — resume um pouco.")
    .optional()
    .transform((v) => v || undefined),
  strava: z
    .string()
    .trim()
    .max(200, "Isso passou de 200 caracteres — resume um pouco.")
    .optional()
    .transform((v) => v || undefined),
});
export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;

// RF de item 14 — só os tipos de imagem mais comuns, tamanho máximo de 5MB
// (não há requisito de compressão/crop nesta fase, só upload direto).
export const TIPOS_FOTO_PERFIL_ACEITOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const TAMANHO_MAXIMO_FOTO_PERFIL = 5 * 1024 * 1024;
