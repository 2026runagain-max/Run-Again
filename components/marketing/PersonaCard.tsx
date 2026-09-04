import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface PersonaCardProps {
  emoji: string;
  nome: string;
  quote: string;
  descricao: string;
  className?: string;
}

/**
 * Persona Card do design system: borda superior Fire 4px, radius 16px,
 * emoji + quote em fundo Smoke. Usado em /sobre, seção "tribo".
 */
export function PersonaCard({ emoji, nome, quote, descricao, className }: PersonaCardProps) {
  return (
    <Card variant="persona" className={cn("flex flex-col gap-4", className)}>
      <div className="rounded-xl bg-smoke p-5">
        <span className="text-3xl" aria-hidden="true">
          {emoji}
        </span>
        <p className="mt-3 font-display text-xl leading-snug text-ink">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          {nome}
        </p>
        <p className="mt-1 text-sm font-sans text-mid">{descricao}</p>
      </div>
    </Card>
  );
}
