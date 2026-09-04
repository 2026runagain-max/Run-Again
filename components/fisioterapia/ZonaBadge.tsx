import { zonaLabel } from "@/lib/fisioterapia/labels";
import type { ZonaResposta } from "@/lib/fisioterapia/types";
import { cn } from "@/lib/cn";

// O sistema não define verde/amarelo/vermelho (design-system.md). Zona é uma
// leitura de 3 níveis, então diferenciamos por peso/ícone dentro da paleta
// existente, não por matiz nova: verde = neutro (como sucesso), amarela/
// vermelha escalam de fire-ghost para fire sólido (como erro/alerta).
export function ZonaBadge({ zona }: { zona: ZonaResposta }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold font-sans uppercase tracking-[0.16em]",
        zona === "verde" && "border border-mid/30 text-mid",
        zona === "amarela" && "bg-fire-dim border border-fire/30 text-fire-text",
        zona === "vermelha" && "bg-fire text-white",
      )}
    >
      {zona !== "verde" && <span aria-hidden="true">●</span>}
      {zonaLabel[zona]}
    </span>
  );
}
