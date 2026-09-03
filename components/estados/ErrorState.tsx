import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  variant?: "generico" | "404";
  titulo?: string;
  subtitulo?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
  dark?: boolean;
  className?: string;
}

const defaults = {
  generico: {
    titulo: "Isso não devia ter acontecido.",
    subtitulo: "Já estamos de olho nisso. Tenta de novo em alguns segundos.",
    ctaLabel: "Tentar de novo",
  },
  "404": {
    titulo: "Essa página não existe — ou ainda não chegou até aqui.",
    subtitulo: "Volta pro seu painel que a gente te leva de novo pro caminho certo.",
    ctaLabel: "Voltar ao painel",
  },
};

export function ErrorState({
  variant = "generico",
  titulo,
  subtitulo,
  ctaLabel,
  ctaHref,
  onCta,
  dark,
  className,
}: ErrorStateProps) {
  const d = defaults[variant];

  return (
    <Card
      variant="insight"
      className={cn("mx-auto max-w-md p-8 text-center", className)}
      role="alert"
    >
      <h2
        className={cn(
          "font-display text-3xl",
          dark ? "text-white" : "text-ink",
        )}
      >
        {titulo ?? d.titulo}
      </h2>
      <p className="mt-3 font-sans text-sm text-mid">
        {subtitulo ?? d.subtitulo}
      </p>
      {(onCta || ctaHref) && (
        <Button
          variant="primary"
          className="mt-6"
          href={ctaHref}
          onClick={onCta}
        >
          {ctaLabel ?? d.ctaLabel}
        </Button>
      )}
    </Card>
  );
}
