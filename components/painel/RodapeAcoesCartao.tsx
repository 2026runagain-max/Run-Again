import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Rodapé de ações secundárias de um card de evidência (link de navegação,
 * convite de compartilhar com a Comunidade). Um hairline separa esse
 * rodapé do dado principal do card — sem ele, "Ver sessão de hoje" e
 * "Compartilhar isso com o grupo" liam como a mesma frase repetida duas
 * vezes (mesmo peso, mesma cor). O traço não é decoração: é o que deixa
 * claro que são duas ações distintas, não uma continuação da leitura
 * acima. Só aparece quando há pelo menos uma ação pra mostrar.
 *
 * `tom="fire"` — pro único card com fundo tingido (InsightCard, variant
 * "insight"): um hairline `--mid/10` sobre `--fire-dim` quase não aparece;
 * a versão `fire/20` usa o mesmo matiz da borda do próprio card.
 */
export function RodapeAcoesCartao({ children, tom = "claro" }: { children: ReactNode; tom?: "claro" | "fire" }) {
  return (
    <div
      className={cn(
        "mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3",
        tom === "fire" ? "border-fire/20" : "border-mid/10",
      )}
    >
      {children}
    </div>
  );
}
