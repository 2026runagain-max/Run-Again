"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmActionButton } from "@/components/fisioterapia/ConfirmActionButton";
import { ReportarConteudoButton } from "./ReportarConteudoButton";
import { ResponderTopicoForm } from "./ResponderTopicoForm";
import { CLASSE_LINK_DISCRETO } from "./estilos";
import { excluirPostComunidadeAction, excluirRespostaComunidadeAction } from "@/lib/comunidade/actions";
import { comunidadeCopy } from "@/lib/comunidade/copy";
import type { RespostaComunidade, TopicoComunidade } from "@/lib/comunidade/types";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/** RF05 — mesmo mecanismo de PostEvidencia: mostra "✓ Removido" por um instante antes de recarregar a lista. */
function RespostaConversa({ resposta, viewerId }: { resposta: RespostaComunidade; viewerId: string }) {
  const router = useRouter();
  const [removido, setRemovido] = useState(false);

  useEffect(() => {
    if (!removido) return;
    const t = setTimeout(() => router.refresh(), 1800);
    return () => clearTimeout(t);
  }, [removido, router]);

  if (removido) {
    return (
      <li className="font-sans text-sm text-mid" role="status">
        {comunidadeCopy.sucessoExcluir}
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3">
      <Avatar nome={resposta.autor_nome} className="h-7 w-7 text-[10px]" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-xs font-bold text-ink">{resposta.autor_nome}</span>
          <span className="text-[10px] font-sans text-mid">{formatarData(resposta.criado_em)}</span>
        </div>
        <p className="mt-1 font-sans text-sm leading-relaxed text-ink">{resposta.corpo}</p>

        <div className="mt-1">
          {resposta.autor_id === viewerId ? (
            <ConfirmActionButton
              label={comunidadeCopy.botaoExcluir}
              confirmTitulo={comunidadeCopy.confirmExcluirRespostaTitulo}
              confirmCorpo={comunidadeCopy.confirmExcluirRespostaCorpo}
              confirmLabel={comunidadeCopy.confirmExcluirLabel}
              className={CLASSE_LINK_DISCRETO}
              atualizarAoConcluir={false}
              action={() => excluirRespostaComunidadeAction(resposta.id)}
              onSucesso={() => setRemovido(true)}
            />
          ) : (
            <ReportarConteudoButton respostaId={resposta.id} />
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * RF06/RF07 — um tópico e suas respostas, sem aninhamento além de um
 * nível (CA1). Respostas ficam sempre visíveis (mesma lógica de "sem
 * ranking, sem esconder conversa real" — regra §6 do PRD); o formulário de
 * resposta é que fica recolhido até a Returnista pedir pra responder, pra
 * não abrir um textarea por tópico na primeira renderização da lista.
 */
export function TopicoConversa({ topico, viewerId }: { topico: TopicoComunidade; viewerId: string }) {
  const router = useRouter();
  const [respondendo, setRespondendo] = useState(false);
  const [removido, setRemovido] = useState(false);
  const souAutorDoTopico = topico.autor_id === viewerId;

  useEffect(() => {
    if (!removido) return;
    const t = setTimeout(() => router.refresh(), 1800);
    return () => clearTimeout(t);
  }, [removido, router]);

  if (removido) {
    return (
      <li className="rounded-2xl border border-mid/15 bg-white p-5">
        <p className="font-sans text-sm text-mid" role="status">
          {comunidadeCopy.sucessoExcluir}
        </p>
      </li>
    );
  }

  return (
    <li className="rounded-2xl border border-mid/15 bg-white p-5">
      <div className="flex items-start gap-3">
        <Avatar nome={topico.autor_nome} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-sm font-bold text-ink">{topico.autor_nome}</span>
            <span className="text-xs font-sans text-mid">{formatarData(topico.criado_em)}</span>
          </div>

          <h3 className="mt-1 font-display text-xl text-ink">{topico.titulo}</h3>
          <p className="mt-1 font-sans text-sm leading-relaxed text-ink">{topico.corpo}</p>

          <div className="mt-3 flex items-center gap-4 border-t border-mid/10 pt-3">
            <button
              type="button"
              onClick={() => setRespondendo((v) => !v)}
              className="text-sm font-semibold font-sans text-fire-text hover:underline"
            >
              {comunidadeCopy.botaoResponderAbrir}
            </button>

            {souAutorDoTopico ? (
              <ConfirmActionButton
                label={comunidadeCopy.botaoExcluir}
                confirmTitulo={comunidadeCopy.confirmExcluirTopicoTitulo}
                confirmCorpo={comunidadeCopy.confirmExcluirTopicoCorpo}
                confirmLabel={comunidadeCopy.confirmExcluirLabel}
                className={CLASSE_LINK_DISCRETO}
                atualizarAoConcluir={false}
                action={() => excluirPostComunidadeAction(topico.id)}
                onSucesso={() => setRemovido(true)}
              />
            ) : (
              <ReportarConteudoButton postId={topico.id} />
            )}
          </div>

          {respondendo && (
            <div className="mt-4 border-t border-mid/10 pt-4">
              <ResponderTopicoForm topicoId={topico.id} onPublicado={() => setRespondendo(false)} />
            </div>
          )}

          {topico.respostas.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3 border-t border-mid/10 pt-4">
              {topico.respostas.map((resposta) => (
                <RespostaConversa key={resposta.id} resposta={resposta} viewerId={viewerId} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
