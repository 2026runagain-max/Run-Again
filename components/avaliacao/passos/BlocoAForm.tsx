"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoACopy, estados } from "@/lib/avaliacao/copy";
import type { BlocoA } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoA");

export function BlocoAForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoA;
  onSalvo: (valores: BlocoA) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoA>(acao, onSalvo);
  const [houveLesao, setHouveLesao] = useState(valoresIniciais?.houveLesao ?? "");

  return (
    <form action={formAction} onSubmit={onSubmit}>
      <PassoChrome eyebrow={blocoACopy.eyebrow} titulo={blocoACopy.titulo} corpo={blocoACopy.corpo}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium font-sans text-ink">{blocoACopy.houveLesao.label}</label>
          <OpcaoCards name="houveLesao" value={houveLesao} onChange={setHouveLesao} opcoes={blocoACopy.houveLesao.opcoes} />
        </div>

        {houveLesao === "sim" && (
          <div className="flex flex-col gap-5 border-t border-mid/10 pt-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium font-sans text-ink">{blocoACopy.regiaoLesao.label}</label>
              <OpcaoCards name="regiaoLesao" defaultValue={valoresIniciais?.regiaoLesao} opcoes={blocoACopy.regiaoLesao.opcoes} />
            </div>

            <Textarea
              name="descricaoLesao"
              label={blocoACopy.descricaoLesao.label}
              placeholder={blocoACopy.descricaoLesao.placeholder}
              defaultValue={valoresIniciais?.descricaoLesao}
              hint={estados.vazioSubBlocoOpcional}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium font-sans text-ink">{blocoACopy.tratamentoLesao.label}</label>
              <OpcaoCards
                name="tratamentoLesao"
                defaultValue={valoresIniciais?.tratamentoLesao}
                opcoes={blocoACopy.tratamentoLesao.opcoes}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium font-sans text-ink">{blocoACopy.situacaoAtualLesao.label}</label>
              <OpcaoCards
                name="situacaoAtualLesao"
                defaultValue={valoresIniciais?.situacaoAtualLesao}
                opcoes={blocoACopy.situacaoAtualLesao.opcoes}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium font-sans text-ink">{blocoACopy.tempoParado.label}</label>
              <OpcaoCards name="tempoParado" defaultValue={valoresIniciais?.tempoParado} opcoes={blocoACopy.tempoParado.opcoes} />
            </div>
          </div>
        )}

        {state && !state.ok && (
          <p className="text-sm font-sans text-fire-text" role="alert">
            {state.erro}
          </p>
        )}

        <Button type="submit" variant="primary" loading={pending} disabled={!houveLesao} className="self-start">
          Continuar
        </Button>
      </PassoChrome>
    </form>
  );
}
