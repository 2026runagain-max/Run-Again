"use client";

import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoObjetivoCopy } from "@/lib/nutricao/copy";
import type { BlocoObjetivo } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoObjetivo");

export function BlocoObjetivoForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoObjetivo;
  onSalvo: (valores: BlocoObjetivo) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoObjetivo>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoObjetivoCopy.eyebrow} titulo={blocoObjetivoCopy.titulo} corpo={blocoObjetivoCopy.corpo}>
        <div className="flex flex-col gap-2">
          <OpcaoCards
            name="objetivoNutricional"
            defaultValue={valoresIniciais?.objetivoNutricional}
            opcoes={blocoObjetivoCopy.objetivoNutricional.opcoes}
            columns={1}
          />
        </div>

        {state && !state.ok && (
          <p className="text-sm font-sans text-fire-text" role="alert">
            {state.erro}
          </p>
        )}

        <Button type="submit" variant="primary" loading={pending} className="self-start">
          Continuar
        </Button>
      </PassoChrome>
    </form>
  );
}
