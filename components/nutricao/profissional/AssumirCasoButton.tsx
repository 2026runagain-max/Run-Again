"use client";

import { useState, useTransition } from "react";
import { assumirCasoNutricaoAction } from "@/lib/nutricao/actions-profissional";

export function AssumirCasoButton({ casoId }: { casoId: string }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const resultado = await assumirCasoNutricaoAction(casoId);
            if (!resultado.ok) setErro(resultado.erro);
          })
        }
        className="rounded-full bg-fire-dim border border-fire/30 px-4 py-1.5 text-xs font-bold font-sans uppercase tracking-wide text-fire-text transition-colors hover:bg-fire/25 disabled:opacity-40"
      >
        Assumir caso
      </button>
      {erro && <p className="text-xs font-sans text-fire-text">{erro}</p>}
    </div>
  );
}
