import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Sobre fundo --ink: --fire puro já passa 5:1+ (design-system.md). */
  dark?: boolean;
}

/**
 * Label acima de headline — Inter 700 10px uppercase. Sobre fundo claro usa
 * --fire-text (não --fire puro: ver "Gap de contraste registrado" em
 * design-system.md, texto pequeno sobre fundo claro precisa da variante
 * escurecida pra passar AA); sobre --ink usa --fire puro, que já passa.
 * Documentado em design-system.md como componente base, mas até aqui cada
 * tela reimplementava o mesmo <p> na mão — isto substitui essas repetições.
 */
export function Eyebrow({ dark, className, children, ...props }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-[10px] font-bold font-sans uppercase tracking-[0.16em]",
        dark ? "text-fire" : "text-fire-text",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
