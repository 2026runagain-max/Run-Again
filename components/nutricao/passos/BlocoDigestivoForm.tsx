"use client";

import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoNutricaoAction } from "@/lib/nutricao/actions";
import { blocoDigestivoCopy } from "@/lib/nutricao/copy";
import type { BlocoDigestivo } from "@/lib/nutricao/types";

const acao = salvarBlocoNutricaoAction.bind(null, "blocoDigestivo");

export function BlocoDigestivoForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoDigestivo;
  onSalvo: (valores: BlocoDigestivo) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoDigestivo>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoDigestivoCopy.eyebrow} titulo={blocoDigestivoCopy.titulo} corpo={blocoDigestivoCopy.corpo}>
        <OpcaoCards
          name="desconfortoGiCorrida"
          defaultValue={valoresIniciais?.desconfortoGiCorrida}
          opcoes={blocoDigestivoCopy.desconfortoGiCorrida.opcoes}
          columns={1}
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
