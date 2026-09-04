import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EstadoCardPainel } from "./EstadoCardPainel";
import { bandaCargaFormaFrase, bandaCargaFormaLabel, estadosPainel, eyebrowsPainel } from "@/lib/painel/copy";
import { cargaVidaLabel } from "@/lib/fisioterapia/labels";
import type { CargaFormaResumo, ResultadoPainel } from "@/lib/painel/types";

/**
 * RF05 — carga de vida entra combinada aqui, nunca isolada num card próprio
 * (regra §6.5). Sempre banda + frase, nunca gráfico de série temporal
 * nesta versão (RF05-CA2, item 16 LATER).
 */
export function CardCargaForma({ resultado }: { resultado: ResultadoPainel<CargaFormaResumo | null> }) {
  return (
    <Card variant="pillar" className="flex flex-col gap-3">
      <Eyebrow>{eyebrowsPainel.cargaForma}</Eyebrow>

      {!resultado.ok ? (
        <EstadoCardPainel erro />
      ) : !resultado.data ? (
        <EstadoCardPainel texto={estadosPainel.vazioCargaForma} />
      ) : (
        <>
          <p className="font-display text-4xl leading-none text-ink">{bandaCargaFormaLabel[resultado.data.banda]}</p>
          <p className="font-sans text-sm leading-relaxed text-mid">{bandaCargaFormaFrase[resultado.data.banda]}</p>
          {resultado.data.cargaVida && (
            <p className="text-xs font-sans text-mid">
              Carga de vida: {cargaVidaLabel[resultado.data.cargaVida]}
              {resultado.data.cargaVidaOrigem === "diagnostico" && " (do seu diagnóstico — ainda sem resposta de 24h)"}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
