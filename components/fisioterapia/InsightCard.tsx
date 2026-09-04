import { Card } from "@/components/ui/Card";
import type { Insight } from "@/lib/fisioterapia/insight";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card variant="insight">
      <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
        {insight.titulo}
      </p>
      <p className="mt-2 font-sans text-base leading-relaxed text-ink">{insight.texto}</p>
    </Card>
  );
}
