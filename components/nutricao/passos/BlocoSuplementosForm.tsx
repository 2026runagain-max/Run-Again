"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoSuplementosCopy } from "@/lib/nutricao/copy";
import type { BlocoSuplementos } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoSuplementos");

export function BlocoSuplementosForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoSuplementos;
  onSalvo: (valores: BlocoSuplementos) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoSuplementos>(acao, onSalvo);
  const [usa, setUsa] = useState(valoresIniciais?.usaSuplementos ?? "");

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoSuplementosCopy.eyebrow} titulo={blocoSuplementosCopy.titulo} corpo={blocoSuplementosCopy.corpo}>
        <OpcaoCards
          name="usaSuplementos"
          value={usa}
          onChange={setUsa}
          opcoes={blocoSuplementosCopy.usaSuplementos.opcoes}
        />

        {usa === "sim" && (
          <Input
            name="quaisSuplementos"
            label={blocoSuplementosCopy.quaisSuplementos.label}
            placeholder={blocoSuplementosCopy.quaisSuplementos.placeholder}
            defaultValue={valoresIniciais?.quaisSuplementos}
          />
        )}

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
