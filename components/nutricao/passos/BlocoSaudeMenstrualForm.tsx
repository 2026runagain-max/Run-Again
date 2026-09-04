"use client";

import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoSaudeMenstrualCopy } from "@/lib/nutricao/copy";
import type { BlocoSaudeMenstrual } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoSaudeMenstrual");

export function BlocoSaudeMenstrualForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoSaudeMenstrual;
  onSalvo: (valores: BlocoSaudeMenstrual) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoSaudeMenstrual>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoSaudeMenstrualCopy.eyebrow} titulo={blocoSaudeMenstrualCopy.titulo} corpo={blocoSaudeMenstrualCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoSaudeMenstrualCopy.regularidadeCiclo.label}</label>
          <OpcaoCards name="regularidadeCiclo" defaultValue={valoresIniciais?.regularidadeCiclo} opcoes={blocoSaudeMenstrualCopy.regularidadeCiclo.opcoes} columns={1} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoSaudeMenstrualCopy.usaContraceptivoHormonal.label}</label>
          <OpcaoCards name="usaContraceptivoHormonal" defaultValue={valoresIniciais?.usaContraceptivoHormonal} opcoes={blocoSaudeMenstrualCopy.usaContraceptivoHormonal.opcoes} />
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
