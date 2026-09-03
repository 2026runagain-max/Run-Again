"use client";

import { useState, useTransition } from "react";
import { marcarExercicioConcluidoAction } from "@/lib/fisioterapia/actions-corredor";
import { cn } from "@/lib/cn";
import { estadosPainel } from "@/lib/painel/copy";

/**
 * RF02 — checkbox de conclusão por exercício. Otimista (o check aparece na
 * hora) e reversível (RF02-CA2): tocar de novo desmarca. O feedback de
 * sucesso é discreto, ao lado do próprio exercício — nunca um modal, que
 * interromperia o fluxo de marcar o próximo (§8: "sem interromper o fluxo
 * de fazer o próximo exercício").
 */
export function ExercicioCheckbox({
  sessaoExercicioId,
  concluidoInicial,
}: {
  sessaoExercicioId: string;
  concluidoInicial: boolean;
}) {
  const [concluido, setConcluido] = useState(concluidoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const proximoValor = !concluido;
    setErro(null);
    setConcluido(proximoValor); // otimista
    setConfirmado(false);

    startTransition(async () => {
      const resultado = await marcarExercicioConcluidoAction(sessaoExercicioId, proximoValor);
      if (!resultado.ok) {
        setConcluido(!proximoValor); // desfaz o otimismo
        setErro(resultado.erro);
        return;
      }
      if (proximoValor) {
        setConfirmado(true);
        window.setTimeout(() => setConfirmado(false), 2500);
      }
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={concluido}
        aria-label={concluido ? "Marcar como não concluído" : "Marcar como concluído"}
        onClick={alternar}
        disabled={pending}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire/40",
          concluido ? "border-ink bg-ink text-white" : "border-mid/40 text-transparent hover:border-ink",
          pending && "opacity-60",
        )}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 10.5L8 14.5L16 5.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {confirmado && (
        <span className="text-[10px] font-sans font-semibold text-mid" role="status">
          {estadosPainel.sucessoExercicioConcluido}
        </span>
      )}
      {erro && (
        <span className="max-w-[6rem] text-center text-[10px] font-sans text-fire-text" role="alert">
          Não salvou. Tenta de novo.
        </span>
      )}
    </div>
  );
}
