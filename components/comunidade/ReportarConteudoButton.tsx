"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { reportarConteudoComunidadeAction } from "@/lib/comunidade/actions";
import { comunidadeCopy } from "@/lib/comunidade/copy";

/**
 * RF08 — escopo mínimo: grava a denúncia pra revisão manual do time, sem
 * fila nem painel de moderação nesta versão (§4, item 8/14 do PRD).
 * Confirmação em modal próprio (nunca window.confirm) — mesmo padrão de
 * ConfirmActionButton, com um campo a mais (motivo opcional).
 */
export function ReportarConteudoButton({ postId, respostaId }: { postId?: string; respostaId?: string }) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [pending, startTransition] = useTransition();

  if (enviado) {
    return (
      <span className="text-xs font-sans text-mid" role="status">
        {comunidadeCopy.sucessoReportar}
      </span>
    );
  }

  function confirmar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await reportarConteudoComunidadeAction({
        postId,
        respostaId,
        motivo: motivo.trim() || undefined,
      });
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      setAberto(false);
      setEnviado(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs font-sans text-mid underline decoration-mid/40 underline-offset-2 hover:text-ink"
      >
        {comunidadeCopy.botaoReportar}
      </button>

      <Modal open={aberto} onClose={() => (pending ? null : setAberto(false))} titulo={comunidadeCopy.modalReportarTitulo}>
        <p className="font-sans text-sm text-mid">{comunidadeCopy.modalReportarCorpo}</p>

        <div className="mt-4">
          <Textarea
            label={comunidadeCopy.motivoLabel}
            hint={comunidadeCopy.motivoHint}
            value={motivo}
            maxLength={500}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Opcional."
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
          <Button type="button" variant="primary" onClick={confirmar} loading={pending}>
            {comunidadeCopy.botaoReportarConfirmar}
          </Button>
        </div>
      </Modal>
    </>
  );
}
