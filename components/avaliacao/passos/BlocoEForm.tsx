"use client";

import { Button } from "@/components/ui/Button";
import { EscalaSlider } from "@/components/avaliacao/EscalaSlider";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoECopy, labelReceioPrincipal } from "@/lib/avaliacao/copy";
import type { Persona } from "@/lib/types";
import type { BlocoE } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoE");

export function BlocoEForm({
  valoresIniciais,
  persona,
  onSalvo,
}: {
  valoresIniciais?: BlocoE;
  persona: Persona | null;
  onSalvo: (valores: BlocoE) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoE>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoECopy.eyebrow} titulo={blocoECopy.titulo} corpo={blocoECopy.corpo}>
        <EscalaSlider
          name="medoLesionar"
          label={blocoECopy.medoLesionar.label}
          hint={blocoECopy.medoLesionar.hint}
          defaultValue={valoresIniciais?.medoLesionar ?? 0}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{labelReceioPrincipal(persona)}</label>
          <OpcaoCards name="receioPrincipal" defaultValue={valoresIniciais?.receioPrincipal} opcoes={blocoECopy.receioPrincipal.opcoes} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoECopy.motivacaoPrincipal.label}</label>
          <OpcaoCards
            name="motivacaoPrincipal"
            defaultValue={valoresIniciais?.motivacaoPrincipal}
            opcoes={blocoECopy.motivacaoPrincipal.opcoes}
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
