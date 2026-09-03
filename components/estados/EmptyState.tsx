import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  titulo?: string;
  subtitulo: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

export function EmptyState({
  titulo = "Ainda não tem nada por aqui.",
  subtitulo,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: EmptyStateProps) {
  return (
    <Card variant="pillar" className={cn("p-8 text-center", className)}>
      <h2 className="text-lg font-extrabold font-sans text-ink">{titulo}</h2>
      <p className="mt-2 font-sans text-sm text-mid">{subtitulo}</p>
      {(onCta || ctaHref) && (
        <Button
          variant="fire-ghost"
          className="mt-5"
          href={ctaHref}
          onClick={onCta}
        >
          {ctaLabel}
        </Button>
      )}
    </Card>
  );
}
