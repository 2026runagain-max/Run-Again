import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EstadoCardPainel } from "./EstadoCardPainel";
import { RodapeAcoesCartao } from "./RodapeAcoesCartao";
import { CompartilharEvidenciaButton } from "@/components/comunidade/CompartilharEvidenciaButton";
import { estadosPainel, eyebrowsPainel, riscoCopy } from "@/lib/painel/copy";
import { bandaRiscoLabel } from "@/lib/avaliacao/copy";
import type { ResultadoPainel, RiscoResumo } from "@/lib/painel/types";
import type { ElegibilidadeCompartilhar } from "@/lib/comunidade/types";

const ORDEM_BANDA = { baixo: 0, moderado: 1, alto: 2 } as const;

/**
 * RF06 — score nunca aparece sozinho (regra §6.3): sempre banda + frase, com
 * comparação explícita ao ponto de partida quando há dado suficiente
 * (RF06-CA1). Sem dado novo, mostra a banda original com o estado "ainda é
 * seu ponto de partida" (RF06-CA2).
 *
 * `compartilhar` — RF01 da Comunidade: convite inline, só quando esta
 * mesma leitura ainda não foi compartilhada (lib/comunidade/queries.ts,
 * aindaNaoCompartilhada).
 *
 * `atendimentoIniciado` — feedback da Marina (teste real, 2026-09): sem
 * isto, o card mostrava a banda autorrelatada do questionário (inclusive
 * "Risco baixo") como se já fosse uma leitura clínica confirmada, mesmo sem
 * nenhum profissional ter avaliado o caso. Enquanto for `false`, o card
 * nunca mostra banda nenhuma — só "Em avaliação", seja qual for o resultado
 * do autorrelato.
 */
export function CardRisco({
  resultado,
  compartilhar,
  atendimentoIniciado,
}: {
  resultado: ResultadoPainel<RiscoResumo>;
  compartilhar?: ElegibilidadeCompartilhar | null;
  atendimentoIniciado: boolean;
}) {
  return (
    <Card variant="pillar" className="flex flex-col gap-3">
      <Eyebrow>{eyebrowsPainel.risco}</Eyebrow>

      {!atendimentoIniciado ? (
        <>
          <p className="font-display text-4xl leading-none text-ink">{estadosPainel.emAvaliacaoRisco.label}</p>
          <EstadoCardPainel texto={estadosPainel.emAvaliacaoRisco.frase} />
        </>
      ) : !resultado.ok ? (
        <EstadoCardPainel erro />
      ) : !resultado.data.temDadoNovo ? (
        <>
          <p className="font-display text-4xl leading-none text-ink">{bandaRiscoLabel[resultado.data.bandaInicial]}</p>
          <EstadoCardPainel texto={estadosPainel.vazioRisco} />
        </>
      ) : (
        <>
          <p className="font-display text-4xl leading-none text-ink">{bandaRiscoLabel[resultado.data.bandaAtual]}</p>
          <p className="font-sans text-sm leading-relaxed text-mid">
            {ORDEM_BANDA[resultado.data.bandaAtual] < ORDEM_BANDA[resultado.data.bandaInicial]
              ? riscoCopy.comparacaoMelhorou(
                  bandaRiscoLabel[resultado.data.bandaInicial],
                  bandaRiscoLabel[resultado.data.bandaAtual],
                )
              : ORDEM_BANDA[resultado.data.bandaAtual] > ORDEM_BANDA[resultado.data.bandaInicial]
                ? riscoCopy.comparacaoPiorou(
                    bandaRiscoLabel[resultado.data.bandaInicial],
                    bandaRiscoLabel[resultado.data.bandaAtual],
                  )
                : riscoCopy.comparacaoEstavel(bandaRiscoLabel[resultado.data.bandaAtual])}
          </p>
        </>
      )}

      {compartilhar && (
        <RodapeAcoesCartao>
          <CompartilharEvidenciaButton
            tipoEvidencia="risco"
            chave={compartilhar.chave}
            textoEvidencia={compartilhar.textoEvidencia}
          />
        </RodapeAcoesCartao>
      )}
    </Card>
  );
}
