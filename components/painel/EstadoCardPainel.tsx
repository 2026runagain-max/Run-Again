import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { estadosPainel } from "@/lib/painel/copy";

/**
 * Sub-estado vazio/erro dentro de um card do painel (§8 do PRD). Mais leve
 * que EmptyState/ErrorState (pensados pra tela inteira) — aqui é só um
 * trecho dentro de um Card já existente no grid do painel.
 */
export function EstadoCardPainel({ texto, erro }: { texto?: string; erro?: boolean }) {
  if (erro) {
    return (
      <div className="flex flex-col gap-3" role="alert">
        <p className="font-sans text-sm leading-relaxed text-fire-text">{estadosPainel.erroGenerico.subtitulo}</p>
        <Button href="/corredor/painel" variant="fire-ghost" className="self-start px-4 py-2 text-xs">
          {estadosPainel.erroGenerico.cta}
        </Button>
      </div>
    );
  }

  return <p className={cn("font-sans text-sm leading-relaxed text-mid")}>{texto}</p>;
}
