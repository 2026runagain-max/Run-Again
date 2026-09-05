"use client";

import { useActionState, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { responderTopicoComunidadeAction } from "@/lib/comunidade/actions";
import { comunidadeCopy } from "@/lib/comunidade/copy";

/**
 * RF07 — responder a um tópico existente. Mesmo mecanismo de reset de
 * CriarTopicoForm.
 *
 * `valorInicial` — QA (feedback da Marina): "não existe como responder a
 * um comentário", só ao tópico. Em vez de aninhamento de verdade (exigiria
 * coluna nova, migration, árvore de resposta — desproporcional pro beta),
 * cada resposta ganhou um botão "Responder" que pré-preenche este campo com
 * "@Nome" — mesmo formulário único do tópico, sem estrutura nova.
 */
export function ResponderTopicoForm({
  topicoId,
  valorInicial,
  onPublicado,
}: {
  topicoId: string;
  valorInicial?: string;
  onPublicado?: () => void;
}) {
  const [state, formAction, pending] = useActionState(responderTopicoComunidadeAction, null);
  const [formKey, setFormKey] = useState(0);

  // Reset do formulário: ajuste de estado durante a renderização, mesmo
  // padrão de CriarTopicoForm (não é um Effect — é derivado de "o estado
  // da action mudou").
  const [stateAnterior, setStateAnterior] = useState(state);
  if (state !== stateAnterior) {
    setStateAnterior(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }

  // Avisar o componente pai (recolher o formulário) é, sim, um efeito
  // colateral de verdade — comunicação com um sistema externo a este
  // componente, não sincronização de estado interno.
  useEffect(() => {
    if (state?.ok) onPublicado?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="topicoId" value={topicoId} />
      <Textarea
        name="corpo"
        label={comunidadeCopy.botaoResponder}
        placeholder={comunidadeCopy.respostaPlaceholder}
        defaultValue={valorInicial}
        autoFocus={!!valorInicial}
        maxLength={2000}
        required
        className="min-h-16"
      />
      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}
      <Button type="submit" variant="fire-ghost" loading={pending} className="self-start px-4 py-2 text-xs">
        {comunidadeCopy.botaoResponder}
      </Button>
    </form>
  );
}
