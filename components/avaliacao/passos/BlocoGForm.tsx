"use client";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoGCopy, estados } from "@/lib/avaliacao/copy";
import type { BlocoG } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoG");

export function BlocoGForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoG;
  onSalvo: (valores: BlocoG) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoG>(acao, onSalvo);

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoGCopy.eyebrow} titulo={blocoGCopy.titulo} corpo={blocoGCopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoGCopy.localTreino.label}</label>
          <OpcaoCards name="localTreino" defaultValue={valoresIniciais?.localTreino} opcoes={blocoGCopy.localTreino.opcoes} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoGCopy.acessoEquipamento.label}</label>
          <OpcaoCards
            name="acessoEquipamento"
            defaultValue={valoresIniciais?.acessoEquipamento}
            opcoes={blocoGCopy.acessoEquipamento.opcoes}
          />
        </div>

        <Textarea
          name="observacaoAmbiente"
          label={blocoGCopy.observacaoAmbiente.label}
          placeholder={blocoGCopy.observacaoAmbiente.placeholder}
          defaultValue={valoresIniciais?.observacaoAmbiente}
          hint={estados.vazioSubBlocoOpcional}
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
