"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoAlimentarCopy } from "@/lib/nutricao/copy";
import type { BlocoAlimentar } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoAlimentar");

export function BlocoAlimentarForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoAlimentar;
  onSalvo: (valores: BlocoAlimentar) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoAlimentar>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoAlimentarCopy.eyebrow} titulo={blocoAlimentarCopy.titulo} corpo={blocoAlimentarCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoAlimentarCopy.padraoAlimentar.label}</label>
          <OpcaoCards name="padraoAlimentar" defaultValue={valoresIniciais?.padraoAlimentar} opcoes={blocoAlimentarCopy.padraoAlimentar.opcoes} />
        </div>

        <Input
          name="alergiasIntolerancias"
          label={blocoAlimentarCopy.alergiasIntolerancias.label}
          placeholder={blocoAlimentarCopy.alergiasIntolerancias.placeholder}
          defaultValue={valoresIniciais?.alergiasIntolerancias}
        />

        <Input
          name="refeicoesPorDia"
          type="number"
          min={1}
          max={10}
          label={blocoAlimentarCopy.refeicoesPorDia.label}
          placeholder={blocoAlimentarCopy.refeicoesPorDia.placeholder}
          defaultValue={valoresIniciais?.refeicoesPorDia}
          required
        />

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
