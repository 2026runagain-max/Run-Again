import "server-only";
import { enviarEmail } from "@/lib/email/send";

/**
 * RF09 (MUST — fila de segurança) + notificação por e-mail (item 17, SHOULD).
 * A fila em si (casos_nutricao) já é a fonte de verdade — falha de envio de
 * e-mail nunca bloqueia a abertura do caso (mesma postura de
 * lib/avaliacao/notificar-equipe.ts: falha aqui é só registrada, nunca
 * propagada como erro pro corredor).
 */
export async function notificarEquipeSobreAlertaSeguranca(input: {
  nomeCorredor: string;
  emailCorredor: string;
  flagsTitulos: string[];
}) {
  const destino = process.env.EMAIL_EQUIPE_NUTRICAO_DESTINO ?? process.env.EMAIL_EQUIPE_DESTINO;
  if (!destino) {
    return { ok: false as const, erro: "EMAIL_EQUIPE_NUTRICAO_DESTINO não configurado neste ambiente." };
  }

  const linhas = input.flagsTitulos.map((t) => `  • ${t}`).join("\n");
  const texto = `${input.nomeCorredor} (${input.emailCorredor}) concluiu a avaliação nutricional e a triagem sinalizou:\n\n${linhas}\n\nO caso já está na fila de segurança do painel profissional.`;

  return enviarEmail({
    to: destino,
    subject: `Novo alerta de segurança — Nutrição — ${input.nomeCorredor}`,
    html: `<div style="font-family:-apple-system,sans-serif;">
      <p style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C43C08;margin:0 0 8px;">Alerta de segurança — Nutrição Esportiva</p>
      <h1 style="font:700 22px/1.3 -apple-system,sans-serif;color:#0A0A0A;margin:0 0 16px;">${input.nomeCorredor}</h1>
      <ul style="font:14px/1.6 -apple-system,sans-serif;color:#0A0A0A;">${input.flagsTitulos.map((t) => `<li>${t}</li>`).join("")}</ul>
      <p style="margin-top:16px;font:13px/1.5 -apple-system,sans-serif;color:#6B6B6B;">Caso disponível na fila de segurança do painel profissional.</p>
    </div>`,
    text: texto,
  });
}

/** RF14 (SHOULD) — reforço não-bloqueante de que a orientação está pronta. */
export async function notificarCorredorOrientacaoPronta(input: { emailCorredor: string; nomeCorredor: string }) {
  return enviarEmail({
    to: input.emailCorredor,
    subject: "Sua orientação nutricional está pronta — Run Again",
    html: `<div style="font-family:-apple-system,sans-serif;">
      <h1 style="font:700 22px/1.3 -apple-system,sans-serif;color:#0A0A0A;margin:0 0 12px;">Sua orientação está pronta, ${input.nomeCorredor}.</h1>
      <p style="font:14px/1.6 -apple-system,sans-serif;color:#0A0A0A;">Calculada pra sua semana de treino. Dá uma olhada no seu painel quando puder.</p>
    </div>`,
    text: `Sua orientação nutricional está pronta, ${input.nomeCorredor}. Dá uma olhada no seu painel quando puder.`,
  });
}
