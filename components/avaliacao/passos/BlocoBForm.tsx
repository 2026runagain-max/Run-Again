"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoBCopy } from "@/lib/avaliacao/copy";
import type { BlocoB } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoB");

export function BlocoBForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoB;
  onSalvo: (valores: BlocoB) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoB>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoBCopy.eyebrow} titulo={blocoBCopy.titulo} corpo={blocoBCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoBCopy.objetivoPrincipal.label}</label>
          <OpcaoCards
            name="objetivoPrincipal"
            defaultValue={valoresIniciais?.objetivoPrincipal}
            opcoes={blocoBCopy.objetivoPrincipal.opcoes}
          />
        </div>

        <Input
          name="provaAlvo"
          label={blocoBCopy.provaAlvo.label}
          placeholder={blocoBCopy.provaAlvo.placeholder}
          defaultValue={valoresIniciais?.provaAlvo}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoBCopy.prazoObjetivo.label}</label>
          <OpcaoCards name="prazoObjetivo" defaultValue={valoresIniciais?.prazoObjetivo} opcoes={blocoBCopy.prazoObjetivo.opcoes} />
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
