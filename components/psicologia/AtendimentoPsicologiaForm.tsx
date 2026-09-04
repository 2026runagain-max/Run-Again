"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { salvarAtendimentoPsicologiaAction } from "@/lib/psicologia/actions-profissional";
import type { Atendimento } from "@/lib/fisioterapia/types";

/**
 * RF-5 — mesma máquina de estados de atendimento do Fluxo 1, mas com os
 * três campos de texto livre relidos na chave da especialidade psicologia
 * (relato / evolução e decisão / plano — §2.2 do PRD: "Liga, conversa, e
 * registra evolução/decisão/plano no mesmo padrão de atendimento do Fluxo
 * 1"), em vez do sentido clínico de fisioterapia (queixa/histórico/
 * observações).
 */
export function AtendimentoPsicologiaForm({ atendimento, pacienteId }: { atendimento: Atendimento; pacienteId: string }) {
  const acaoLigada = salvarAtendimentoPsicologiaAction.bind(null, atendimento.id, pacienteId);
  const [state, formAction, pending] = useActionState(acaoLigada, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Textarea
        name="relato"
        label="O que conversamos"
        defaultValue={atendimento.queixa_principal ?? ""}
        placeholder="O que o corredor trouxe, com as palavras dele."
        required
      />

      <Textarea
        name="evolucaoDecisao"
        label="Evolução e decisão"
        defaultValue={atendimento.historico_subjetivo ?? ""}
        placeholder="O que mudou desde o último contato, e o que foi decidido nesta conversa."
      />

      <Textarea
        name="plano"
        label="Plano — próximos passos"
        defaultValue={atendimento.observacoes_objetivas ?? ""}
        placeholder="O que acompanhar até o próximo contato."
      />

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm font-sans text-mid" role="status">
          ✓ Atendimento salvo.
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Salvar atendimento
      </Button>
    </form>
  );
}
