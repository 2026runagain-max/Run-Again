"use client";

import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoDCopy } from "@/lib/avaliacao/copy";
import type { BlocoD } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoD");

export function BlocoDForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoD;
  onSalvo: (valores: BlocoD) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoD>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoDCopy.eyebrow} titulo={blocoDCopy.titulo} corpo={blocoDCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoDCopy.qualidadeSono.label}</label>
          <OpcaoCards name="qualidadeSono" defaultValue={valoresIniciais?.qualidadeSono} opcoes={blocoDCopy.qualidadeSono.opcoes} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoDCopy.horasSono.label}</label>
          <OpcaoCards name="horasSono" defaultValue={valoresIniciais?.horasSono} opcoes={blocoDCopy.horasSono.opcoes} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoDCopy.alimentacaoPercebida.label}</label>
          <OpcaoCards
            name="alimentacaoPercebida"
            defaultValue={valoresIniciais?.alimentacaoPercebida}
            opcoes={blocoDCopy.alimentacaoPercebida.opcoes}
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
