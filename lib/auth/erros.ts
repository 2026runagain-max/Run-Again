/**
 * Traduz mensagens de erro do Supabase Auth para a voz da marca.
 * Nunca expõe detalhe técnico (status HTTP, nome de classe) ao usuário.
 */
export function mensagemDeErroAuth(erro: unknown): string {
  const msg = erro instanceof Error ? erro.message : String(erro);

  if (/invalid login credentials/i.test(msg)) {
    return "E-mail ou senha inválidos.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Confirma seu e-mail antes de entrar — manda um link novo se não achar o primeiro.";
  }
  if (/rate limit|too many requests/i.test(msg)) {
    return "Muitas tentativas seguidas. Espera um pouco antes de tentar de novo.";
  }
  if (/user already registered|already been registered/i.test(msg)) {
    return "Já existe uma conta com esse e-mail.";
  }
  if (/password should be at least/i.test(msg)) {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }

  return "Isso não devia ter acontecido. Tenta de novo em alguns segundos.";
}
