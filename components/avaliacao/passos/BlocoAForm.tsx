"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { OpcaoCards } from "@/components/avaliacao/OpcaoCards";
import { PassoChrome } from "@/components/avaliacao/PassoChrome";
import { useBlocoForm } from "@/components/avaliacao/useBlocoForm";
import { salvarBlocoAction } from "@/lib/avaliacao/actions";
import { blocoACopy, estados } from "@/lib/avaliacao/copy";
import { blocoACompleto } from "@/lib/avaliacao/diagnostico";
import type { BlocoA } from "@/lib/avaliacao/types";

const acao = salvarBlocoAction.bind(null, "blocoA");

// QA do beta: antes desta correção, o botão "Continuar" só olhava
// `houveLesao` — dava pra clicar em "Continuar" tendo respondido "Sim" e
// nada mais, sem nenhum dos 4 campos condicionais (região, tratamento,
// situação atual, tempo parado). O clique então falhava no servidor com
// uma mensagem genérica ("Escolhe uma opção pra continuar.") que não dizia
// qual das 4 perguntas estava faltando — achado como "ponto sem saída"
// (BLOCKER: a Returnista pode ficar presa aqui sem entender por quê).
// Agora o botão só habilita quando o mesmo critério do servidor
// (blocoACompleto, reaproveitado de lib/avaliacao/diagnostico.ts) já está
// satisfeito no client.
export function BlocoAForm({
  valoresIniciais,
  onSalvo,
}: {
  valoresIniciais?: BlocoA;
  onSalvo: (valores: BlocoA) => void;
}) {
  const { state, formAction, pending, onSubmit } = useBlocoForm<BlocoA>(acao, onSalvo);
  const [houveLesao, setHouveLesao] = useState(valoresIniciais?.houveLesao ?? "");
  const [regiaoLesao, setRegiaoLesao] = useState(valoresIniciais?.regiaoLesao ?? "");
  const [tratamentoLesao, setTratamentoLesao] = useState(valoresIniciais?.tratamentoLesao ?? "");
  const [situacaoAtualLesao, setSituacaoAtualLesao] = useState(valoresIniciais?.situacaoAtualLesao ?? "");
  const [tempoParado, setTempoParado] = useState(valoresIniciais?.tempoParado ?? "");

  const podeContinuar = blocoACompleto({
    houveLesao: houveLesao as BlocoA["houveLesao"],
    regiaoLesao: regiaoLesao as BlocoA["regiaoLesao"],
    tratamentoLesao: tratamentoLesao as BlocoA["tratamentoLesao"],
    situacaoAtualLesao: situacaoAtualLesao as BlocoA["situacaoAtualLesao"],
    tempoParado: tempoParado as BlocoA["tempoParado"],
  });

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
              <OpcaoCards
                name="regiaoLesao"
                value={regiaoLesao}
                onChange={setRegiaoLesao}
                opcoes={blocoACopy.regiaoLesao.opcoes}
              />
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
                value={tratamentoLesao}
                onChange={setTratamentoLesao}
                opcoes={blocoACopy.tratamentoLesao.opcoes}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium font-sans text-ink">{blocoACopy.situacaoAtualLesao.label}</label>
              <OpcaoCards
                name="situacaoAtualLesao"
                value={situacaoAtualLesao}
                onChange={setSituacaoAtualLesao}
                opcoes={blocoACopy.situacaoAtualLesao.opcoes}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium font-sans text-ink">{blocoACopy.tempoParado.label}</label>
              <OpcaoCards name="tempoParado" value={tempoParado} onChange={setTempoParado} opcoes={blocoACopy.tempoParado.opcoes} />
            </div>
          </div>
        )}

        {state && !state.ok && (
          <p className="text-sm font-sans text-fire-text" role="alert">
            {state.erro}
          </p>
        )}

        <Button type="submit" variant="primary" loading={pending} disabled={!podeContinuar} className="self-start">
          Continuar
        </Button>
      </PassoChrome>
    </form>
  );
}
