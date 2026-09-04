"use client";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoHCopy, estados } from "@/lib/avaliacao/copy";
import type { BlocoH } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoH");

export function BlocoHForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoH;
  onSalvo: (valores: BlocoH) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoH>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoHCopy.eyebrow} titulo={blocoHCopy.titulo} corpo={blocoHCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoHCopy.prioridadeAgora.label}</label>
          <OpcaoCards
            name="prioridadeAgora"
            defaultValue={valoresIniciais?.prioridadeAgora}
            opcoes={blocoHCopy.prioridadeAgora.opcoes}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoHCopy.expectativaAcompanhamento.label}</label>
          <OpcaoCards
            name="expectativaAcompanhamento"
            defaultValue={valoresIniciais?.expectativaAcompanhamento}
            opcoes={blocoHCopy.expectativaAcompanhamento.opcoes}
          />
        </div>

        <Textarea
          name="algoMais"
          label={blocoHCopy.algoMais.label}
          placeholder={blocoHCopy.algoMais.placeholder}
          defaultValue={valoresIniciais?.algoMais}
          hint={estados.vazioSubBlocoOpcional}
        />

        {state && !state.ok && (
          <p className="text-sm font-sans text-fire-text" role="alert">
            {state.erro}
          </p>
        )}

        <Button type="submit" variant="primary" loading={pending} className="self-start">
          Ver meu diagnóstico
        </Button>
      </PassoChrome>
    </form>
  );
}
