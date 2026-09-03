"use client";

import { useActionState, useEffect, useRef, type FormEvent } from "react";
import { formDataParaObjeto } from "@/lib/avaliacao/form-utils";

type Resultado = { ok: true; data?: undefined } | { ok: false; erro: string };

/**
 * Estado comum de todo passo de bloco (A–H): dispara a server action de
 * autosave e, no sucesso, entrega ao chamador os valores que acabaram de ser
 * submetidos — não só um "ok". Sem isso, clicar em "Voltar" pra revisar um
 * bloco já salvo mostraria o formulário vazio até a próxima navegação de
 * página inteira: os valores iniciais do wizard vêm de uma leitura do
 * servidor feita antes desta sessão de edição começar.
 */
export function useBlocoForm<T>(
  action: (prevState: unknown, formData: FormData) => Promise<Resultado>,
  onSalvo: (valores: T) => void,
) {
  const [state, formAction, pending] = useActionState(action, null);
  const capturado = useRef<T | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    capturado.current = formDataParaObjeto(new FormData(event.currentTarget)) as T;
  }

  useEffect(() => {
    if (state?.ok && capturado.current) onSalvo(capturado.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { state, formAction, pending, onSubmit };
}
