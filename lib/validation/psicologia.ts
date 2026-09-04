import { z } from "zod";

const nota0a10 = (mensagem: string) =>
  z.coerce.number({ error: mensagem }).int(mensagem).min(0, mensagem).max(10, mensagem);

// RF-1.1 — C1/C2/C5 obrigatórios, C3/C4 opcionais (§10.1 do PRD, CA1).
export const checkinPsicologiaSchema = z.object({
  c1Confianca: nota0a10("Informe sua confiança, de 0 a 10."),
  c2Medo: nota0a10("Informe seu medo de se lesionar, de 0 a 10."),
  c3Disposicao: z.coerce.number().int().min(0).max(10).optional(),
  c4TextoLivre: z.string().trim().max(1000, "Isso passou de 1000 caracteres — resume um pouco.").optional(),
  c5QuerConversar: z.enum(["sim", "nao"], { error: "Escolhe uma opção." }),
});
export type CheckinPsicologiaInput = z.infer<typeof checkinPsicologiaSchema>;

// RF-5 — reaproveita a máquina de estados de atendimento do Fluxo 1
// (queixa_principal/historico_subjetivo/observacoes_objetivas), com rótulos
// próprios da especialidade psicologia (evolução/decisão/plano, §2.2 do
// PRD) em vez dos rótulos clínicos de fisioterapia.
export const atendimentoPsicologiaSchema = z.object({
  relato: z.string().trim().min(3, "Descreve, em poucas palavras, o que foi conversado."),
  evolucaoDecisao: z.string().trim().optional(),
  plano: z.string().trim().optional(),
});
export type AtendimentoPsicologiaInput = z.infer<typeof atendimentoPsicologiaSchema>;
