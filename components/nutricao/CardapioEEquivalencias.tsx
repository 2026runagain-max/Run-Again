"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { tipoDiaLabel } from "@/lib/nutricao/labels";
import { listarEquivalencias, montarCardapioBasico } from "@/lib/nutricao/alimentos";
import type { MacrosOrientacao, TipoDia } from "@/lib/nutricao/types";

const TIPOS_DIA: TipoDia[] = ["treino_leve", "treino_longo_ou_intenso", "descanso"];

const LABEL_MACRO = { carboidrato: "Carboidrato", proteina: "Proteína", gordura: "Gordura" } as const;

/**
 * Item 15 (feedback da Marina) — "isso equivale a..." e cardápio básico,
 * os dois calculados em cima do alvo de macros já calculado pra essa
 * pessoa (macros.porTipoDia), nunca um valor genérico. A escolha de tipo
 * de dia é o único controle: troca qual fatia do alvo os dois blocos
 * abaixo usam, sem recarregar nada do servidor (lib/nutricao/alimentos.ts
 * é aritmética pura sobre um dado que já veio pronto).
 */
export function CardapioEEquivalencias({ macros }: { macros: MacrosOrientacao }) {
  const [tipoDia, setTipoDia] = useState<TipoDia>("treino_leve");
  const macrosDoDia = macros.porTipoDia[tipoDia];
  const cardapio = montarCardapioBasico(macrosDoDia);

  const equivalencias = [
    { macro: "carboidrato" as const, gramas: macrosDoDia.carboidratoG },
    { macro: "proteina" as const, gramas: macrosDoDia.proteinaG },
    { macro: "gordura" as const, gramas: macrosDoDia.gorduraG },
  ];

  return (
    <Card variant="pillar" className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl text-ink">Isso equivale a... e cardápio básico</h2>
        <p className="mt-1 text-sm font-sans text-mid">
          Calculado em cima do seu alvo de macros — escolha o tipo de dia pra ver a quantidade certa pra você.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIPOS_DIA.map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoDia(tipo)}
            aria-pressed={tipoDia === tipo}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-sans font-semibold transition-colors",
              tipoDia === tipo
                ? "border-fire bg-fire-dim text-fire-text"
                : "border-mid/25 text-mid hover:border-mid/40",
            )}
          >
            {tipoDiaLabel[tipo]}
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-display text-lg text-ink">Isso equivale a...</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {equivalencias.map(({ macro, gramas }) => (
            <div key={macro} className="rounded-xl border border-mid/15 p-3">
              <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
                {LABEL_MACRO[macro]} · {Math.round(gramas)} g
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {listarEquivalencias(macro, gramas).map((op) => (
                  <li key={op.alimento} className="text-sm font-sans text-ink">
                    <span className="font-semibold">{op.alimento}</span>
                    <span className="text-mid"> — {op.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink">Cardápio básico do dia</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cardapio.refeicoes.map((refeicao) => (
            <div key={refeicao.nome} className="rounded-xl border border-mid/15 p-3">
              <p className="text-sm font-sans font-bold text-ink">{refeicao.nome}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {refeicao.itens.map((item) => (
                  <li key={item.alimento} className="text-sm font-sans text-ink">
                    {item.alimento} <span className="text-mid">— {item.quantidade}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-sans text-mid">{cardapio.nota}</p>
      </div>
    </Card>
  );
}
