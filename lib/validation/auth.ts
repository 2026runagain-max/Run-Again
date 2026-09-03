import { z } from "zod";

const senha = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.");

export const cadastroCorredorSchema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome completo."),
  email: z.email("Informe um e-mail válido."),
  senha,
  codigoConvite: z.string().trim().min(1, "Informe o código de convite de beta."),
  termosAceitos: z.literal(true, {
    error: "É preciso aceitar os termos de uso e a política de privacidade.",
  }),
});
export type CadastroCorredorInput = z.infer<typeof cadastroCorredorSchema>;

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const solicitarRecuperacaoSchema = z.object({
  email: z.email("Informe um e-mail válido."),
});
export type SolicitarRecuperacaoInput = z.infer<typeof solicitarRecuperacaoSchema>;

export const redefinirSenhaSchema = z
  .object({
    senha,
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;

export const definirSenhaConviteSchema = z
  .object({
    senha,
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });
export type DefinirSenhaConviteInput = z.infer<typeof definirSenhaConviteSchema>;
