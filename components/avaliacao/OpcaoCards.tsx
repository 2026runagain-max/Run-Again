"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface Opcao {
  valor: string;
  label: string;
  descricao?: string;
}

export interface OpcaoCardsProps {
  name: string;
  opcoes: Opcao[];
  defaultValue?: string;
  value?: string;
  onChange?: (valor: string) => void;
  columns?: 1 | 2;
}

/**
 * Campo de escolha única em cards clicáveis — "Persona Card" / variação de
 * Pillar Card do design system, usado em toda a avaliação em vez de <select>
 * nativo, para o produto parecer Run Again em cada tela, não um formulário
 * genérico.
 *
 * Funciona controlado (passa value/onChange — necessário quando o passo
 * precisa saber a escolha atual, ex.: ramificação do Bloco A) ou não
 * controlado (só defaultValue — a maioria dos campos). Em ambos os casos
 * expõe um input hidden com o valor atual, então funciona dentro de
 * <form action={...}> como qualquer outro campo nativo.
 *
 * Segue o padrão de teclado de um radiogroup nativo (WAI-ARIA Authoring
 * Practices): setas movem foco e seleção juntos, e só um item por vez fica
 * no fluxo de Tab (roving tabindex) — reivindicar role="radio" sem isso
 * seria pior que não usar a role, porque cria uma expectativa de teclado
 * que o componente não cumpre.
 */
export function OpcaoCards({ name, opcoes, defaultValue, value, onChange, columns = 2 }: OpcaoCardsProps) {
  const [interno, setInterno] = useState(defaultValue ?? "");
  const atual = value !== undefined ? value : interno;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function selecionar(valor: string) {
    if (onChange) onChange(valor);
    else setInterno(valor);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const indiceAtual = opcoes.findIndex((o) => o.valor === atual);
    let proximo: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      proximo = indiceAtual < 0 ? 0 : (indiceAtual + 1) % opcoes.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      proximo = indiceAtual < 0 ? opcoes.length - 1 : (indiceAtual - 1 + opcoes.length) % opcoes.length;
    }

    if (proximo === null) return;
    event.preventDefault();
    selecionar(opcoes[proximo].valor);
    refs.current[proximo]?.focus();
  }

  return (
    <div role="radiogroup" onKeyDown={onKeyDown} className={cn("grid gap-2.5", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}>
      <input type="hidden" name={name} value={atual} />
      {opcoes.map((opcao, i) => {
        const selecionada = atual === opcao.valor;
        // Roving tabindex: sem seleção, só o primeiro item entra no Tab —
        // depois disso, só o item selecionado.
        const primeiroFocavel = atual ? selecionada : i === 0;
        return (
          <button
            key={opcao.valor}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selecionada}
            tabIndex={primeiroFocavel ? 0 : -1}
            onClick={() => selecionar(opcao.valor)}
            className={cn(
              "flex flex-col gap-0.5 rounded-[14px] border bg-white px-4 py-3 text-left text-sm font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire/30",
              selecionada ? "border-fire bg-fire-dim" : "border-mid/25 hover:border-mid/50",
            )}
          >
            <span className={cn("font-semibold", selecionada ? "text-fire-text" : "text-ink")}>{opcao.label}</span>
            {opcao.descricao && <span className="text-xs text-mid">{opcao.descricao}</span>}
          </button>
        );
      })}
    </div>
  );
}
