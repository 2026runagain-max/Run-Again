import "server-only";
import { enviarEmail } from "@/lib/email/send";
import type { Diagnostico, RespostasAvaliacao } from "./types";
import type { Persona } from "@/lib/types";
import { labelPersona } from "@/lib/labels";
import { bandaRiscoLabel, blocoACopy, blocoBCopy, blocoECopy, blocoFCopy } from "./copy";

function opcaoLabel(opcoes: { valor: string; label: string }[], valor?: string | null): string {
  if (!valor) return "—";
  return opcoes.find((o) => o.valor === valor)?.label ?? valor;
}

/**
 * RF06-CA2 — resumo estruturado (não o formulário bruto inteiro) das
 * respostas-chave dos Blocos A, B, E e F, mais o diagnóstico completo.
 */
function montarResumoTexto(respostas: RespostasAvaliacao, persona: Persona | null, diagnostico: Diagnostico): string {
  const { blocoA, blocoB, blocoE, blocoF } = respostas;

  const linhas: string[] = [
    `Persona: ${persona ? labelPersona[persona] : "não definida"}`,
    `→ ${diagnostico.fraseIdentidade}`,
    "",
    `Banda de risco: ${bandaRiscoLabel[diagnostico.bandaRisco]}`,
    `→ ${diagnostico.bandaRiscoFrase}`,
    "",
    `Hipótese biomecânica inicial: ${diagnostico.perfilBiomecanicoFrase}`,
    "",
    `Perfil psicológico inicial: ${diagnostico.perfilPsicologicoFrase}`,
    "",
    "Pontos de atenção prioritários:",
    ...diagnostico.pontosAtencao.map((p, i) => `  ${i + 1}. ${p.titulo} — ${p.texto}`),
    "",
    "— Bloco A (histórico de lesão) —",
    `Houve lesão nos últimos 12 meses: ${blocoA?.houveLesao === "sim" ? "Sim" : "Não"}`,
  ];

  if (blocoA?.houveLesao === "sim") {
    linhas.push(
      `Região: ${opcaoLabel(blocoACopy.regiaoLesao.opcoes, blocoA.regiaoLesao)}`,
      `Tratamento: ${opcaoLabel(blocoACopy.tratamentoLesao.opcoes, blocoA.tratamentoLesao)}`,
      `Situação atual: ${opcaoLabel(blocoACopy.situacaoAtualLesao.opcoes, blocoA.situacaoAtualLesao)}`,
      `Tempo parado: ${opcaoLabel(blocoACopy.tempoParado.opcoes, blocoA.tempoParado)}`,
    );
    if (blocoA.descricaoLesao) linhas.push(`Descrição (livre): ${blocoA.descricaoLesao}`);
  }

  linhas.push(
    "",
    "— Bloco B (objetivo) —",
    `Objetivo principal: ${opcaoLabel(blocoBCopy.objetivoPrincipal.opcoes, blocoB?.objetivoPrincipal)}`,
    `Prazo: ${opcaoLabel(blocoBCopy.prazoObjetivo.opcoes, blocoB?.prazoObjetivo)}`,
  );
  if (blocoB?.provaAlvo) linhas.push(`Prova/data alvo: ${blocoB.provaAlvo}`);

  linhas.push(
    "",
    "— Bloco E (perfil psicológico) —",
    `Medo de lesionar (0-10): ${blocoE?.medoLesionar ?? "—"}`,
    `Receio principal: ${opcaoLabel(blocoECopy.receioPrincipal.opcoes, blocoE?.receioPrincipal)}`,
    `Motivação principal: ${opcaoLabel(blocoECopy.motivacaoPrincipal.opcoes, blocoE?.motivacaoPrincipal)}`,
    "",
    "— Bloco F (rotina e carga de vida) —",
    `Maior desafio da rotina: ${opcaoLabel(blocoFCopy.desafioRotina.opcoes, blocoF?.desafioRotina)}`,
    `Nível de movimento no dia a dia: ${opcaoLabel(blocoFCopy.nivelMovimentoDia.opcoes, blocoF?.nivelMovimentoDia)}`,
    `Tempo disponível por semana: ${opcaoLabel(blocoFCopy.tempoDisponivelSemana.opcoes, blocoF?.tempoDisponivelSemana)}`,
  );

  return linhas.join("\n");
}

function montarResumoHtml(texto: string, nomeCorredor: string): string {
  const corpo = texto
    .split("\n")
    .map((linha) => (linha.trim() === "" ? "<br/>" : `<p style="margin:0 0 4px;font:14px/1.5 -apple-system,sans-serif;color:#0A0A0A;">${linha}</p>`))
    .join("\n");

  return `
    <div style="font-family:-apple-system,sans-serif;">
      <p style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#C43C08;margin:0 0 8px;">
        Novo diagnóstico inicial — Run Again
      </p>
      <h1 style="font:700 22px/1.3 -apple-system,sans-serif;color:#0A0A0A;margin:0 0 16px;">${nomeCorredor}</h1>
      ${corpo}
      <p style="margin-top:20px;font:13px/1.5 -apple-system,sans-serif;color:#6B6B6B;">
        Este diagnóstico é uma hipótese inicial autorrelatada — ponto de partida para a primeira conversa, não substitui avaliação clínica.
      </p>
    </div>
  `;
}

/**
 * RF06 — dispara a notificação à Equipe Run Again assim que o diagnóstico é
 * calculado (RF06-CA1, automático). Falha de envio não bloqueia nem
 * invalida o diagnóstico (RF06-CA3) — a chamadora apenas registra o erro
 * para retentativa manual.
 */
export async function notificarEquipeSobreDiagnostico(input: {
  nomeCorredor: string;
  emailCorredor: string;
  persona: Persona | null;
  respostas: RespostasAvaliacao;
  diagnostico: Diagnostico;
}) {
  const destino = process.env.EMAIL_EQUIPE_DESTINO;
  if (!destino) {
    return { ok: false as const, erro: "EMAIL_EQUIPE_DESTINO não configurado neste ambiente." };
  }

  const resumo = montarResumoTexto(input.respostas, input.persona, input.diagnostico);
  const texto = `${input.nomeCorredor} (${input.emailCorredor}) concluiu a avaliação inicial.\n\n${resumo}`;

  return enviarEmail({
    to: destino,
    subject: `Novo diagnóstico inicial — ${input.nomeCorredor}`,
    html: montarResumoHtml(texto, input.nomeCorredor),
    text: texto,
  });
}
