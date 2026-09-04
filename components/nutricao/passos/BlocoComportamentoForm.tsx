"use client";

import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoComportamentoCopy } from "@/lib/nutricao/copy";
import type { BlocoComportamento } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoComportamento");

function Escala0a10({ name, label, hint, defaultValue }: { name: string; label: string; hint: string; defaultValue?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium font-sans text-ink">
        {label}
        <span className="mt-0.5 block font-normal text-xs text-mid">{hint}</span>
      </label>
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          type="range"
          min={0}
          max={10}
          step={1}
          defaultValue={defaultValue ?? 0}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-smoke accent-fire"
          onInput={(e) => {
            const output = e.currentTarget.nextElementSibling as HTMLOutputElement | null;
            if (output) output.value = e.currentTarget.value;
          }}
        />
        <output htmlFor={name} className="w-6 text-center font-display text-xl text-fire-text">
          {defaultValue ?? 0}
        </output>
      </div>
    </div>
  );
}

export function BlocoComportamentoForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoComportamento;
  onSalvo: (valores: BlocoComportamento) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoComportamento>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoComportamentoCopy.eyebrow} titulo={blocoComportamentoCopy.titulo} corpo={blocoComportamentoCopy.corpo}>
        <Escala0a10
          name="preocupacaoComPeso"
          label={blocoComportamentoCopy.preocupacaoComPeso.label}
          hint={blocoComportamentoCopy.preocupacaoComPeso.hint}
          defaultValue={valoresIniciais?.preocupacaoComPeso}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoComportamentoCopy.historicoRestricaoAlimentar.label}</label>
          <OpcaoCards
            name="historicoRestricaoAlimentar"
            defaultValue={valoresIniciais?.historicoRestricaoAlimentar}
            opcoes={blocoComportamentoCopy.historicoRestricaoAlimentar.opcoes}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoComportamentoCopy.comportamentoCompensatorio.label}</label>
          <OpcaoCards
            name="comportamentoCompensatorio"
            defaultValue={valoresIniciais?.comportamentoCompensatorio}
            opcoes={blocoComportamentoCopy.comportamentoCompensatorio.opcoes}
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
