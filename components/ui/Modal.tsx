"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Modal próprio da aplicação — nenhuma confirmação crítica do produto pode
 * depender de window.confirm/alert nativos do navegador.
 */
export function Modal({ open, onClose, titulo, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // QA (feedback da Marina): campos de texto dentro do modal (ex.: legenda
  // de "Compartilhar isso com o grupo") perdiam o foco a cada tecla —
  // pior com a barra de espaço, onde ficava quase inutilizável pra
  // qualquer frase com mais de uma palavra. Causa: quem chama <Modal>
  // costuma passar `onClose` como arrow function inline
  // (`onClose={() => setAberto(false)}`), que é uma referência NOVA a cada
  // render do componente pai — e digitar no campo controlado da legenda
  // re-renderiza o pai a cada tecla. Como o efeito abaixo tinha `onClose`
  // no array de dependências, ele reexecutava a cada tecla digitada,
  // chamando `dialogRef.current?.focus()` de novo e roubando o foco do
  // campo de volta pro container do modal. Fix: guardar o onClose mais
  // recente numa ref (sempre atualizada, sem precisar de efeito pra isso)
  // e tirar `onClose` do array de dependências — o efeito de foco/Escape
  // só reexecuta quando `open` muda de verdade, não a cada tecla.
  const onCloseRef = useRef(onClose);
  // Atualiza a ref num efeito sem array de dependências (roda depois de
  // TODO render, sem precisar listar `onClose`) — não pode ser uma
  // atribuição direta durante a renderização (`onCloseRef.current = onClose`
  // aqui em cima), que é mutação de ref em tempo de render e quebra a regra
  // react-hooks/refs (e a suposição de pureza do React Compiler).
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKeyDown);

    const previoOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previoOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl focus:outline-none",
          className,
        )}
      >
        <h2 id="modal-titulo" className="font-display text-2xl text-ink">
          {titulo}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
