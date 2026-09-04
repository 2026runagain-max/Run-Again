// Elegibilidade do convite "Compartilhar isso com o grupo" (RF01) — regra
// §6 do PRD: "a Comunidade nunca é uma segunda fonte de verdade". Cada
// função aqui só lê o resultado que o painel/evolução JÁ calcularam
// (lib/painel/calculo.ts, lib/fisioterapia/insight.ts) e devolve a MESMA
// frase que a Returnista já vê na tela — nunca uma frase nova, nunca um
// recálculo. Sem consulta ao banco aqui dentro (nenhum import de
// createClient) — é puro, mesma filosofia de lib/painel/calculo.ts.

import type { AderenciaResumo, CargaFormaResumo, ResultadoPainel, RiscoResumo } from "@/lib/painel/types";
import { aderenciaFrasePorFaixa, bandaCargaFormaFrase, riscoCopy } from "@/lib/painel/copy";
import { bandaRiscoLabel } from "@/lib/avaliacao/copy";
import type { Insight } from "@/lib/fisioterapia/insight";
import type { ElegibilidadeCompartilhar } from "./types";

const ORDEM_BANDA = { baixo: 0, moderado: 1, alto: 2 } as const;

/**
 * RF01-CA1 — só elegível quando existe uma comparação de verdade pra
 * compartilhar (mesmo critério de "dado suficiente" do card): a banda
 * inicial sozinha, sem nenhuma resposta de 24h ainda, não é evidência nova,
 * é só o ponto de partida — mesmo texto que o card já mostra como estado
 * vazio (EstadoCardPainel), não uma "conquista" pra levar ao grupo.
 */
export function elegibilidadeRisco(resultado: ResultadoPainel<RiscoResumo>): ElegibilidadeCompartilhar | null {
  if (!resultado.ok || !resultado.data.temDadoNovo) return null;

  const { bandaAtual, bandaInicial } = resultado.data;
  const inicialLabel = bandaRiscoLabel[bandaInicial];
  const atualLabel = bandaRiscoLabel[bandaAtual];

  const textoEvidencia =
    ORDEM_BANDA[bandaAtual] < ORDEM_BANDA[bandaInicial]
      ? riscoCopy.comparacaoMelhorou(inicialLabel, atualLabel)
      : ORDEM_BANDA[bandaAtual] > ORDEM_BANDA[bandaInicial]
        ? riscoCopy.comparacaoPiorou(inicialLabel, atualLabel)
        : riscoCopy.comparacaoEstavel(atualLabel);

  return { elegivel: true, chave: `risco:${bandaAtual}`, textoEvidencia };
}

export function elegibilidadeCargaForma(
  resultado: ResultadoPainel<CargaFormaResumo | null>,
): ElegibilidadeCompartilhar | null {
  if (!resultado.ok || !resultado.data) return null;

  const { banda } = resultado.data;
  return { elegivel: true, chave: `carga_forma:${banda}`, textoEvidencia: bandaCargaFormaFrase[banda] };
}

/**
 * Regra mais rígida do PRD (§6): "aderência nunca aparece sem frase de
 * contexto no feed" — texto_evidencia sempre combina o número com a frase
 * por faixa, nunca o percentual isolado.
 */
export function elegibilidadeAderencia(
  resultado: ResultadoPainel<AderenciaResumo | null>,
): ElegibilidadeCompartilhar | null {
  if (!resultado.ok || !resultado.data) return null;

  const { concluidos, prescritos, percentual } = resultado.data;
  const textoEvidencia = `${percentual}% concluído nesta sessão — ${concluidos} de ${prescritos} exercícios. ${aderenciaFrasePorFaixa(percentual)}`;

  return { elegivel: true, chave: `aderencia:${concluidos}/${prescritos}`, textoEvidencia };
}

export function elegibilidadeInsight(insight: Insight | null): ElegibilidadeCompartilhar | null {
  if (!insight) return null;
  return { elegivel: true, chave: `insight:${insight.texto}`, textoEvidencia: insight.texto };
}
