"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { publicarEvidenciaComunidadeAction } from "@/lib/comunidade/actions";
import { comunidadeCopy } from "@/lib/comunidade/copy";
import type { TipoEvidenciaComunidade } from "@/lib/comunidade/types";
import { cn } from "@/lib/cn";

/**
 * RF01/RF02 — o link inline que aparece nos 4 cards de evidência elegível
 * (painel: risco, carga/forma, aderência; evolução: insight). CA2: clicar
 * não publica nada por si só — abre este modal próprio da aplicação (nunca
 * window.confirm) com a frase que vai ser postada, já formatada, e um
 * campo de legenda opcional.
 */
export function CompartilharEvidenciaButton({
  tipoEvidencia,
  chave,
  textoEvidencia,
  className,
}: {
  tipoEvidencia: TipoEvidenciaComunidade;
  chave: string;
  textoEvidencia: string;
  className?: string;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [legenda, setLegenda] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pending, startTransition] = useTransition();

  // §8 — sucesso é feedback discreto, sem modal: o modal já fechou antes
  // deste texto aparecer. Ele some sozinho assim que o painel recarregar
  // (o card deixa de oferecer o convite pra esta mesma evidência — RF02-CA2).
  if (sucesso) {
    return (
      <p className={cn("text-sm font-semibold font-sans text-ink", className)} role="status">
        {comunidadeCopy.sucessoPublicarEvidencia}
      </p>
    );
  }

  function compartilhar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await publicarEvidenciaComunidadeAction({
        tipoEvidencia,
        chave,
        textoEvidencia,
        legenda: legenda.trim() || undefined,
      });
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      setAberto(false);
      setSucesso(true);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className={cn("text-left text-sm font-semibold font-sans text-fire-text hover:underline", className)}
      >
        {comunidadeCopy.ctaCompartilhar}
      </button>

      <Modal open={aberto} onClose={() => (pending ? null : setAberto(false))} titulo={comunidadeCopy.modalCompartilharTitulo}>
        <p className="rounded-lg bg-smoke p-3 font-sans text-sm leading-relaxed text-ink">“{textoEvidencia}”</p>

        <div className="mt-4">
          <Textarea
            label={comunidadeCopy.legendaLabel}
            hint={comunidadeCopy.legendaHint}
            value={legenda}
            maxLength={200}
            onChange={(e) => setLegenda(e.target.value)}
            placeholder="Fica à vontade — ou deixa em branco."
          />
        </div>

        {erro && (
          <p className="mt-3 text-sm font-sans text-fire-text" role="alert">
            {erro}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="border-ink text-ink hover:bg-ink/5"
            onClick={() => setAberto(false)}
            disabled={pending}
          >
            {comunidadeCopy.botaoCancelar}
          </Button>
          <Button type="button" variant="primary" onClick={compartilhar} loading={pending}>
            {comunidadeCopy.botaoCompartilhar}
          </Button>
        </div>
      </Modal>
    </>
  );
}
