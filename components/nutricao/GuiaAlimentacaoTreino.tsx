"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { selecionarBlocoAlimentacaoTreino, type ContextoTreinoHoje } from "@/lib/nutricao/guia-treino";

const OPCOES: { valor: ContextoTreinoHoje; label: string }[] = [
  { valor: "sem_treino_hoje", label: "Descanso hoje" },
  { valor: "treino_curto", label: "Treino curto" },
  { valor: "treino_longo", label: "Treino longo" },
  { valor: "prova", label: "É dia de prova" },
  { valor: "pos_treino", label: "Já treinei" },
];

/**
 * RF05 (M09) — 5 blocos fixos selecionados por gatilho. Nota de arquitetura
 * (lib/nutricao/guia-treino.ts): o PRD espera TIME_TO_TRAINING/TRAINING_DEMAND
 * lidos automaticamente do calendário de treino do Fluxo 3, que não existe
 * neste codebase. Como stand-in funcional, o próprio corredor escolhe o
 * contexto do dia com um toque — continua sendo "selecionado por gatilho",
 * só que o gatilho é a resposta mais confiável disponível hoje: a pessoa que
 * vai treinar. Troca pela leitura automática assim que a trilha de treino
 * existir.
 */
export function GuiaAlimentacaoTreino() {
  const [contexto, setContexto] = useState<ContextoTreinoHoje>("treino_curto");
  const bloco = selecionarBlocoAlimentacaoTreino(contexto);

  return (
    <Card variant="pillar" className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Alimentação de hoje</p>
        <h2 className="mt-1 font-display text-2xl text-ink">O que você vai treinar hoje?</h2>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="O que você vai treinar hoje?">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={contexto === opcao.valor}
            onClick={() => setContexto(opcao.valor)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-sans font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire/30",
              contexto === opcao.valor ? "border-fire bg-fire-dim text-fire-text" : "border-mid/25 text-ink hover:border-mid/50",
            )}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-display text-xl text-ink">{bloco.titulo}</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {bloco.itens.map((item, i) => (
            <li key={i} className="text-sm font-sans text-ink">
              <span className="font-semibold">{item.refeicao}:</span> {item.sugestao}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-sans text-mid">{bloco.nota}</p>
      </div>
    </Card>
  );
}
