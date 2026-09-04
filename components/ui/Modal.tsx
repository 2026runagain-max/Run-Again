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

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    const previoOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previoOverflow;
    };
  }, [open, onClose]);

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
