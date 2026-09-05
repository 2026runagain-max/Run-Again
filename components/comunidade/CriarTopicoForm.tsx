"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { criarTopicoComunidadeAction } from "@/lib/comunidade/actions";
import { comunidadeCopy } from "@/lib/comunidade/copy";

/**
 * RF06 — abrir um novo tópico. O tópico entra no mural via revalidatePath
 * (o próprio Server Component da página recarrega a lista) — este
 * componente só limpa os campos depois de publicar (troca de `key`
 * remonta o <form>) e mostra a confirmação discreta de §8.
 */
export function CriarTopicoForm() {
  const [state, formAction, pending] = useActionState(criarTopicoComunidadeAction, null);
  const [formKey, setFormKey] = useState(0);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  // Ajuste de estado durante a renderização (não num Effect) ao detectar
  // uma nova resposta bem-sucedida da action — padrão recomendado pra
  // "resetar estado quando um valor muda" (react.dev/learn/you-might-not-
  // need-an-effect). O timeout que esconde a confirmação, por sua vez,
  // precisa mesmo de um Effect (é sincronização com um timer externo).
  const [stateAnterior, setStateAnterior] = useState(state);
  if (state !== stateAnterior) {
    setStateAnterior(state);
    if (state?.ok) {
      setFormKey((k) => k + 1);
      setMostrarSucesso(true);
    }
  }

  useEffect(() => {
    if (!mostrarSucesso) return;
    const t = setTimeout(() => setMostrarSucesso(false), 2500);
    return () => clearTimeout(t);
  }, [mostrarSucesso]);

  return (
    <form
      key={formKey}
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-mid/15 bg-white p-5"
    >
      <Input
        name="titulo"
        label={comunidadeCopy.novoTopicoTituloLabel}
        placeholder={comunidadeCopy.novoTopicoTituloPlaceholder}
        maxLength={140}
        required
      />
      <Textarea
        name="corpo"
        label={comunidadeCopy.novoTopicoCorpoLabel}
        placeholder={comunidadeCopy.novoTopicoCorpoPlaceholder}
        maxLength={2000}
        required
      />

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}
      {mostrarSucesso && (
        <p className="text-sm font-sans text-ink" role="status">
          {comunidadeCopy.sucessoPublicarTopicoOuResposta}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        {comunidadeCopy.botaoPublicarTopico}
      </Button>
    </form>
  );
}
