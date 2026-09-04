"use client";

import { Button } from "@/components/ui/Button";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoFCopy } from "@/lib/avaliacao/copy";
import type { BlocoF } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoF");

export function BlocoFForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoF;
  onSalvo: (valores: BlocoF) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoF>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoFCopy.eyebrow} titulo={blocoFCopy.titulo} corpo={blocoFCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoFCopy.desafioRotina.label}</label>
          <OpcaoCards name="desafioRotina" defaultValue={valoresIniciais?.desafioRotina} opcoes={blocoFCopy.desafioRotina.opcoes} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoFCopy.nivelMovimentoDia.label}</label>
          <OpcaoCards
            name="nivelMovimentoDia"
            defaultValue={valoresIniciais?.nivelMovimentoDia}
            opcoes={blocoFCopy.nivelMovimentoDia.opcoes}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoFCopy.tempoDisponivelSemana.label}</label>
          <OpcaoCards
            name="tempoDisponivelSemana"
            defaultValue={valoresIniciais?.tempoDisponivelSemana}
            opcoes={blocoFCopy.tempoDisponivelSemana.opcoes}
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
