"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { pedirRevisaoNutricionalAction } from "@/lib/nutricao/actions";

/**
 * RF10-CA1 — "pedido explícito do corredor" entra na mesma fila de revisão
 * que o gatilho automático de M10. Nunca window.confirm — o próprio botão já
 * é a confirmação (ação reversível/de baixo risco, sem necessidade de modal).
 */
export function PedirRevisaoButton() {
  const [pending, startTransition] = useTransition();
  const [feito, setFeito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (feito) {
    return <p className="text-sm font-sans text-mid">✓ Pedido enviado — a equipe já vê seu caso na fila de revisão.</p>;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="fire-ghost"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const resultado = await pedirRevisaoNutricionalAction();
            if (resultado.ok) setFeito(true);
            else setErro(resultado.erro);
          })
        }
      >
        Isso não está funcionando pra mim — pedir revisão
      </Button>
      {erro && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
