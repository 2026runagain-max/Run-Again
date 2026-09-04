"use client";

import { useTransition } from "react";
import { refeicaoLabel } from "@/lib/nutricao/labels";
import { removerRegistroAlimentarAction } from "@/lib/nutricao/actions";
import type { RegistroAlimentar } from "@/lib/nutricao/types";

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function ListaRegistrosAlimentares({ registros }: { registros: RegistroAlimentar[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <ul className="flex flex-col gap-3">
      {registros.map((r) => (
        <li key={r.id} className="flex items-start justify-between gap-3 border-b border-mid/10 pb-3 last:border-0 last:pb-0">
          <div>
            <p className="font-sans text-sm font-semibold text-ink">
              {r.nome_alimento}
              {r.marca && <span className="font-normal text-mid"> — {r.marca}</span>}
            </p>
            <p className="text-xs font-sans text-mid">
              {refeicaoLabel[r.refeicao]} · {formatarDataHora(r.registrado_em)}
              {r.porcao_descricao && ` · ${r.porcao_descricao}`}
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void removerRegistroAlimentarAction(r.id);
              })
            }
            className="shrink-0 text-xs font-sans text-mid hover:text-fire-text disabled:opacity-40"
          >
            Remover
          </button>
        </li>
      ))}
    </ul>
  );
}
