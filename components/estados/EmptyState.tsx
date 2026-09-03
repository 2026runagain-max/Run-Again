import { Button } from "@/components/ui/Button";
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
    <div
      className={cn(
        "rounded-[14px] border-b-[3px] border-fire bg-white p-8 text-center shadow-sm",
        className,
      )}
    >
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
    </div>
  );
}
