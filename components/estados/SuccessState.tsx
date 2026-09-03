import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface SuccessStateProps {
  titulo?: string;
  subtitulo: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  className?: string;
}

export function SuccessState({
  titulo = "Feito.",
  subtitulo,
  ctaLabel,
  ctaHref,
  onCta,
  className,
}: SuccessStateProps) {
  return (
    <div className={cn("text-center", className)}>
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink"
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10.5L8 14.5L16 5.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 font-display text-3xl text-ink">{titulo}</h2>
      <p className="mt-2 font-sans text-sm text-mid">{subtitulo}</p>
      {(onCta || ctaHref) && (
        <Button
          variant="primary"
          className="mt-6"
          href={ctaHref}
          onClick={onCta}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
