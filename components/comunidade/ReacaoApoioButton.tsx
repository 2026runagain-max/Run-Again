"use client";

import { useState, useTransition } from "react";
import { reagirComunidadeAction } from "@/lib/comunidade/actions";
import { cn } from "@/lib/cn";

/**
 * RF04 — reação única de apoio, otimista e reversível (CA1: tocar de novo
 * remove). Mesmo padrão de ExercicioCheckbox: o estado muda na hora, sem
 * modal, sem confirmação — regra §6 do PRD: "nenhuma notificação... a
 * contagem, quando exibida, segue hierarquia de metadado discreto, nunca
 * tipografia de stat".
 */
export function ReacaoApoioButton({
  postId,
  reagidoInicial,
  totalInicial,
}: {
  postId: string;
  reagidoInicial: boolean;
  totalInicial: number;
}) {
  const [reagido, setReagido] = useState(reagidoInicial);
  const [total, setTotal] = useState(totalInicial);
  const [erro, setErro] = useState(false);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const proximoValor = !reagido;
    setErro(false);
    setReagido(proximoValor); // otimista
    setTotal((t) => t + (proximoValor ? 1 : -1));

    startTransition(async () => {
      const resultado = await reagirComunidadeAction(postId, proximoValor);
      if (!resultado.ok) {
        setReagido(!proximoValor); // desfaz o otimismo
        setTotal((t) => t + (proximoValor ? -1 : 1));
        setErro(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-pressed={reagido}
        aria-label={reagido ? "Remover apoio" : "Apoiar"}
        onClick={alternar}
        disabled={pending}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire/40",
          reagido ? "border-ink bg-ink text-white" : "border-mid/40 text-mid hover:border-ink hover:text-ink",
          pending && "opacity-60",
        )}
      >
        {/* Duas marcas se encontrando — não um coração de "curtida" de rede
            social (regra do produto: prova sem prêmio). O ícone é o mesmo
            "você não está sozinha" do onboarding, só que em forma. */}
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="7.5" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" fill={reagido ? "currentColor" : "none"} />
          <circle
            cx="12.5"
            cy="10"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            fill={reagido ? "currentColor" : "none"}
            fillOpacity={reagido ? 0.82 : 1}
          />
        </svg>
      </button>
      {/* Metadado discreto — nunca tipografia de stat (regra §6 do PRD). */}
      {total > 0 && <span className="text-xs font-sans text-mid">{total}</span>}
      {erro && (
        <span className="text-[10px] font-sans text-fire-text" role="alert">
          Não salvou. Tenta de novo.
        </span>
      )}
    </div>
  );
}
