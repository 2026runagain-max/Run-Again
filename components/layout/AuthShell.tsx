import { ReactNode } from "react";

export interface AuthShellProps {
  eyebrow?: string;
  titulo: string;
  children: ReactNode;
}

/**
 * Seção de conteúdo cheia de tela (--ink) com card central --paper,
 * usada dentro das páginas de autenticação. Header (claro) e Footer
 * (escuro) continuam vindo do layout de (publico) — ver PRD seção 4:
 * "header sempre claro, footer sempre escuro", fixo por elemento.
 */
export function AuthShell({
  eyebrow = "RUN AGAIN · BETA",
  titulo,
  children,
}: AuthShellProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-ink px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-paper p-8 shadow-2xl sm:p-10">
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink">{titulo}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
