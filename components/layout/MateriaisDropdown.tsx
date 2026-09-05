"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { materiais } from "@/lib/site/materiais";
import { cn } from "@/lib/cn";

/**
 * "Run Again Materiais" (loja de infoprodutos vendidos via Hotmart) — botão
 * do header, visível deslogado ou logado, em qualquer área (RF1 da tarefa).
 * Abre em hover no desktop (onMouseEnter/onMouseLeave, com um pequeno atraso
 * pra não fechar ao mover o mouse do botão pro menu) e em toque no celular
 * (o próprio onClick do botão alterna aberto/fechado — touch não dispara
 * mouseenter/mouseleave, então o clique é o único gatilho que importa lá).
 *
 * De propósito, isto não mexe em lib/nav-config.ts nem na posição final
 * dentro do resto do menu — o desenho definitivo do menu é uma tarefa
 * separada, já aprovada, que vem depois desta (ver TAREFA).
 */
export function MateriaisDropdown({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const [aberto, setAberto] = useState(false);
  const fecharTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function limparFechamento() {
    if (fecharTimeout.current) {
      clearTimeout(fecharTimeout.current);
      fecharTimeout.current = null;
    }
  }

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => {
        limparFechamento();
        setAberto(true);
      }}
      onMouseLeave={() => {
        fecharTimeout.current = setTimeout(() => setAberto(false), 150);
      }}
    >
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className={cn("text-sm font-semibold font-sans text-ink transition-colors hover:text-fire-text", linkClassName)}
      >
        Run Again Materiais
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-64 rounded-xl border border-mid/15 bg-white py-1 shadow-lg"
        >
          {materiais.map((material) => (
            <Link
              key={material.slug}
              href={material.href}
              role="menuitem"
              className="block px-4 py-2 text-sm font-sans text-ink hover:bg-smoke"
              onClick={() => setAberto(false)}
            >
              {material.nome}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
