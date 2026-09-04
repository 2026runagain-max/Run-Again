"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoBiometriaCopy } from "@/lib/nutricao/copy";
import type { BlocoBiometria } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoBiometria");

export function BlocoBiometriaForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoBiometria;
  onSalvo: (valores: BlocoBiometria) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoBiometria>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoBiometriaCopy.eyebrow} titulo={blocoBiometriaCopy.titulo} corpo={blocoBiometriaCopy.corpo}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="pesoKg"
            type="number"
            step="0.1"
            min={30}
            max={250}
            label={blocoBiometriaCopy.pesoKg.label}
            placeholder={blocoBiometriaCopy.pesoKg.placeholder}
            defaultValue={valoresIniciais?.pesoKg}
            required
          />
          <Input
            name="alturaCm"
            type="number"
            min={120}
            max={230}
            label={blocoBiometriaCopy.alturaCm.label}
            placeholder={blocoBiometriaCopy.alturaCm.placeholder}
            defaultValue={valoresIniciais?.alturaCm}
            required
          />
        </div>

        <Input
          name="idade"
          type="number"
          min={14}
          max={100}
          label={blocoBiometriaCopy.idade.label}
          placeholder={blocoBiometriaCopy.idade.placeholder}
          defaultValue={valoresIniciais?.idade}
          required
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoBiometriaCopy.sexoBiologico.label}</label>
          <OpcaoCards name="sexoBiologico" defaultValue={valoresIniciais?.sexoBiologico} opcoes={blocoBiometriaCopy.sexoBiologico.opcoes} columns={1} />
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
