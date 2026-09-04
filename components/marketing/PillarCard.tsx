import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface PillarCardProps {
  emoji: string;
  nome: string;
  descricao: string;
  href?: string;
  className?: string;
}

/**
 * Pillar Card do design system (design-system.md): borda inferior Fire 3px,
 * radius 14px. Mesmo ícone/nome em toda parte que reaproveita — home
 * (seção "Os 6 pilares"), /metodo e a navegação por pilar do /blog.
 */
export function PillarCard({ emoji, nome, descricao, href, className }: PillarCardProps) {
  const conteudo = (
    <Card
      variant="pillar"
      className={cn(
        "flex h-full flex-col gap-2",
        href && "transition-shadow hover:shadow-md",
        className,
      )}
    >
      <span className="text-3xl" aria-hidden="true">
        {emoji}
      </span>
      <h3 className="font-display text-2xl text-ink">{nome}</h3>
      <p className="text-sm font-sans text-mid">{descricao}</p>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {conteudo}
      </Link>
    );
  }

  return conteudo;
}
