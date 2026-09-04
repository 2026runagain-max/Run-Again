"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoCCopy } from "@/lib/avaliacao/copy";
import type { BlocoC } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoC");

export function BlocoCForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoC;
  onSalvo: (valores: BlocoC) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoC>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoCCopy.eyebrow} titulo={blocoCCopy.titulo} corpo={blocoCCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoCCopy.frequenciaSemanal.label}</label>
          <OpcaoCards
            name="frequenciaSemanal"
            defaultValue={valoresIniciais?.frequenciaSemanal}
            opcoes={blocoCCopy.frequenciaSemanal.opcoes}
          />
        </div>

        <Input
          name="volumeAtualKm"
          type="number"
          min={0}
          max={300}
          label={blocoCCopy.volumeAtualKm.label}
          placeholder={blocoCCopy.volumeAtualKm.placeholder}
          defaultValue={valoresIniciais?.volumeAtualKm}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoCCopy.experienciaCorrida.label}</label>
          <OpcaoCards
            name="experienciaCorrida"
            defaultValue={valoresIniciais?.experienciaCorrida}
            opcoes={blocoCCopy.experienciaCorrida.opcoes}
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
