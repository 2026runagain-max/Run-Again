"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type Resultado = { ok: true; data?: unknown } | { ok: false; erro: string };

export interface ConfirmActionButtonProps {
  label: string;
  variant?: ButtonProps["variant"];
  className?: string;
  confirmTitulo: string;
  confirmCorpo: string;
  confirmLabel: string;
  action: () => Promise<Resultado>;
  onSucesso?: (data?: unknown) => void;
  /** Se true, faz router.refresh() depois de sucesso (padrão: true). */
  atualizarAoConcluir?: boolean;
}

/**
 * Envolve qualquer ação crítica (irreversível ou de mão única, como "enviar
 * para o corredor" ou "finalizar atendimento") num modal de confirmação
 * próprio da aplicação — nunca window.confirm.
 */
export function ConfirmActionButton({
  label,
  variant = "primary",
  className,
  confirmTitulo,
  confirmCorpo,
  confirmLabel,
  action,
  onSucesso,
  atualizarAoConcluir = true,
}: ConfirmActionButtonProps) {
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await action();
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      setAberto(false);
      onSucesso?.(resultado.data);
      if (atualizarAoConcluir) router.refresh();
    });
  }

  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setAberto(true)}>
        {label}
      </Button>

      <Modal open={aberto} onClose={() => (pending ? null : setAberto(false))} titulo={confirmTitulo}>
        <p className="font-sans text-sm text-mid">{confirmCorpo}</p>

        {erro && (
          <p className="mt-3 text-sm font-sans text-fire-text" role="alert">
            {erro}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" className="border-ink text-ink hover:bg-ink/5" onClick={() => setAberto(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={confirmar} loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
