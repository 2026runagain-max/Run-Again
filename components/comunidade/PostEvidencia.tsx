"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ConfirmActionButton } from "@/components/fisioterapia/ConfirmActionButton";
import { ReacaoApoioButton } from "./ReacaoApoioButton";
import { ReportarConteudoButton } from "./ReportarConteudoButton";
import { excluirPostComunidadeAction } from "@/lib/comunidade/actions";
import { comunidadeCopy, labelTipoEvidencia } from "@/lib/comunidade/copy";
import type { PostFeedComunidade } from "@/lib/comunidade/types";
import { CLASSE_LINK_DISCRETO } from "./estilos";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * RF03-CA2 — cada post exibe autor, pilar/tipo de origem, frase de
 * evidência, legenda (se houver) e botão de apoio; nunca um número de
 * reação em destaque tipográfico (regra §6 do PRD — ver ReacaoApoioButton).
 *
 * RF05 — depois de excluir, mostra a confirmação de §8 no lugar do próprio
 * post por alguns instantes (senão o item some da tela rápido demais pra
 * dar tempo de ler "✓ Removido"), e só então recarrega a lista.
 */
export function PostEvidencia({ post, souAutor }: { post: PostFeedComunidade; souAutor: boolean }) {
  const router = useRouter();
  const [removido, setRemovido] = useState(false);

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
        <Avatar nome={post.autor_nome} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sans text-sm font-bold text-ink">{post.autor_nome}</span>
            {/* "PAINEL ·" na frente do tipo — sinal de proveniência, não
                decoração: é o que diferencia esta evidência de um relato
                autodeclarado (a mesma regra que fez o feed existir). */}
            {post.tipo_evidencia && <Badge>PAINEL · {labelTipoEvidencia[post.tipo_evidencia].toUpperCase()}</Badge>}
            <span className="text-xs font-sans text-mid">{formatarData(post.criado_em)}</span>
          </div>

          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{post.texto_evidencia}</p>
          {post.legenda && <p className="mt-1 font-sans text-sm italic leading-relaxed text-mid">“{post.legenda}”</p>}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-mid/10 pt-3">
            <div>
              {/* RF04.1 — reagir é só a quem NÃO é o autor; pro autor,
                  mostra a mesma contagem discreta, sem botão de apoio ao
                  próprio post. */}
              {souAutor ? (
                post.totalReacoes > 0 && <span className="text-xs font-sans text-mid">{post.totalReacoes} apoio(s)</span>
              ) : (
                <ReacaoApoioButton postId={post.id} reagidoInicial={post.euReagi} totalInicial={post.totalReacoes} />
              )}
            </div>

            <div>
              {souAutor ? (
                <ConfirmActionButton
                  label={comunidadeCopy.botaoExcluir}
                  confirmTitulo={comunidadeCopy.confirmExcluirPostTitulo}
                  confirmCorpo={comunidadeCopy.confirmExcluirPostCorpo}
                  confirmLabel={comunidadeCopy.confirmExcluirLabel}
                  className={CLASSE_LINK_DISCRETO}
                  atualizarAoConcluir={false}
                  action={() => excluirPostComunidadeAction(post.id)}
                  onSucesso={() => setRemovido(true)}
                />
              ) : (
                <ReportarConteudoButton postId={post.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
