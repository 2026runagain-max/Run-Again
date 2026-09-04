import { Card } from "@/components/ui/Card";
import { RodapeAcoesCartao } from "@/components/painel/RodapeAcoesCartao";
import { CompartilharEvidenciaButton } from "@/components/comunidade/CompartilharEvidenciaButton";
import type { Insight } from "@/lib/fisioterapia/insight";
import type { ElegibilidadeCompartilhar } from "@/lib/comunidade/types";

/** `compartilhar` — RF01 da Comunidade (ver nota em components/painel/CardRisco.tsx). */
export function InsightCard({ insight, compartilhar }: { insight: Insight; compartilhar?: ElegibilidadeCompartilhar | null }) {
  return (
    <Card variant="insight" className="flex flex-col gap-3">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          {insight.titulo}
        </p>
        <p className="mt-2 font-sans text-base leading-relaxed text-ink">{insight.texto}</p>
      </div>

      {compartilhar && (
        <RodapeAcoesCartao tom="fire">
          <CompartilharEvidenciaButton
            tipoEvidencia="insight"
            chave={compartilhar.chave}
            textoEvidencia={compartilhar.textoEvidencia}
          />
        </RodapeAcoesCartao>
      )}
    </Card>
  );
}
