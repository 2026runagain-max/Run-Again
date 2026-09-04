import { z } from "zod";

export const listaFundadorasSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  email: z.email("Informe um e-mail válido."),
});
export type ListaFundadorasInput = z.infer<typeof listaFundadorasSchema>;
