import "server-only";

export interface EnviarEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type ResultadoEnvio = { ok: true } | { ok: false; erro: string };

/**
 * Serviço de e-mail transacional — ponto único de integração real.
 *
 * O documento de arquitetura global (§1) descreve isto como "mesmo serviço
 * de e-mail transacional já usado no Fluxo 1 para reset de senha". Na
 * implementação real do Fluxo 1, porém, reset de senha usa o e-mail
 * embutido do Supabase Auth (resetPasswordForEmail) — que só envia os
 * templates fixos de autenticação do Supabase, não e-mail transacional de
 * conteúdo arbitrário como o diagnóstico da RF06. Não há, portanto, provedor
 * de e-mail transacional configurado neste repositório ainda.
 *
 * Esta função usa a API HTTP da Resend (https://resend.com) quando
 * RESEND_API_KEY está definida — provedor comum, sem exigir SDK novo (só
 * fetch). Sem a chave configurada, ela não finge sucesso: registra a
 * tentativa e devolve erro explícito, para a chamadora decidir o que fazer
 * (RF06-CA3 já prevê que falha de envio não bloqueia nem invalida o
 * diagnóstico). Para ativar de verdade: configurar RESEND_API_KEY,
 * EMAIL_REMETENTE e EMAIL_EQUIPE_DESTINO em .env.
 */
export async function enviarEmail(input: EnviarEmailInput): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.EMAIL_REMETENTE;

  if (!apiKey || !remetente) {
    console.warn(
      "[email] RESEND_API_KEY/EMAIL_REMETENTE não configurados — e-mail não enviado de verdade.",
      { to: input.to, subject: input.subject },
    );
    return { ok: false, erro: "Serviço de e-mail não configurado neste ambiente." };
  }

  try {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetente,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });

    if (!resposta.ok) {
      const corpo = await resposta.text().catch(() => "");
      return { ok: false, erro: `Provedor de e-mail recusou o envio (${resposta.status}). ${corpo}`.trim() };
    }

    return { ok: true };
  } catch {
    return { ok: false, erro: "Falha de rede ao tentar enviar o e-mail." };
  }
}
