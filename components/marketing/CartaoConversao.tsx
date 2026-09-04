import { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Card claro (--paper) que hospeda o formulário de conversão sobre fundo
 * escuro — mesmo padrão já usado em AuthShell (components/layout/AuthShell.tsx)
 * pra telas de autenticação sobre --ink, aqui reaproveitado pro hero e pelos
 * CTAs escuros da home.
 */
export function CartaoConversao({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-md rounded-2xl bg-paper p-6 text-left shadow-2xl sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
