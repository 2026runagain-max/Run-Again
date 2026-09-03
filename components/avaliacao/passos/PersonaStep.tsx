"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { definirPersonaAction } from "@/lib/avaliacao/actions";
import { personaCopy } from "@/lib/avaliacao/copy";
import type { Persona } from "@/lib/types";

export function PersonaStep({
  valorInicial,
  onNext,
}: {
  valorInicial: Persona | null;
  onNext: (persona: Persona) => void;
}) {
  const [state, formAction, pending] = useActionState(definirPersonaAction, null);
  const [persona, setPersona] = useState<string>(valorInicial ?? "");

  useEffect(() => {
    if (state?.ok && persona) onNext(persona as Persona);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction}>
      <PassoChrome eyebrow={personaCopy.eyebrow} titulo={personaCopy.titulo} corpo={personaCopy.corpo}>
        <OpcaoCards
          name="persona"
          columns={1}
          value={persona}
          onChange={setPersona}
          opcoes={personaCopy.opcoes.map((o) => ({ valor: o.valor, label: o.titulo, descricao: o.descricao }))}
        />

        {state && !state.ok && (
          <p className="text-sm font-sans text-fire-text" role="alert">
            {state.erro}
          </p>
        )}

        <Button type="submit" variant="primary" loading={pending} disabled={!persona} className="self-start">
          Continuar
        </Button>
      </PassoChrome>
    </form>
  );
}
