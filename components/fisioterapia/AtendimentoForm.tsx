"use client";

import { useActionState, useState } from "react";
import { Button, Select, Textarea } from "@/components/ui";
import { Badge } from "@/components/ui/Badge";
import { salvarAvaliacaoAction } from "@/lib/fisioterapia/actions";
import { condicaoLabel } from "@/lib/fisioterapia/labels";
import type { PrefilAtendimento } from "@/lib/fisioterapia/prefil-atendimento";
import type { Atendimento, CondicaoClinica } from "@/lib/fisioterapia/types";

const CONDICOES = Object.keys(condicaoLabel) as CondicaoClinica[];

export function AtendimentoForm({
  atendimento,
  pacienteId,
  prefil,
}: {
  atendimento: Atendimento;
  pacienteId: string;
  /** RF01 — sugestão gerada a partir do diagnóstico. Só chega aqui quando o
   * atendimento ainda não tem nada salvo (RF01-CA3): nunca sobrescreve dado
   * já digitado pelo profissional. */
  prefil?: PrefilAtendimento;
}) {
  const acaoLigada = salvarAvaliacaoAction.bind(null, atendimento.id, pacienteId);
  const [state, formAction, pending] = useActionState(acaoLigada, null);
  // Controlado de propósito: um <select> não-controlado perde a seleção
  // visual quando a Server Action revalida a página e o React reconcilia o
  // <select> com o novo defaultValue do servidor — o dado salva certo (dá
  // pra conferir no banco), mas a tela parecia "esquecer" a escolha.
  const [condicaoPrincipal, setCondicaoPrincipal] = useState(atendimento.condicao_principal ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {prefil && (
        <div>
          <Badge>PRÉ-PREENCHIDO A PARTIR DO DIAGNÓSTICO</Badge>
          <p className="mt-1.5 text-xs font-sans text-mid">
            Os campos abaixo já vêm com o que o corredor contou no diagnóstico dele. Revisa e ajusta à vontade —
            nada aqui foi salvo ainda.
          </p>
        </div>
      )}

      <Select
        name="condicaoPrincipal"
        label="Condição principal"
        value={condicaoPrincipal}
        onChange={(e) => setCondicaoPrincipal(e.target.value)}
        hint="Usada para sugerir exercícios do foco atual — opcional."
      >
        <option value="">Ainda não definida</option>
        {CONDICOES.map((c) => (
          <option key={c} value={c}>
            {condicaoLabel[c]}
          </option>
        ))}
      </Select>

      <Textarea
        name="queixaPrincipal"
        label="Queixa principal"
        defaultValue={atendimento.queixa_principal ?? prefil?.queixaPrincipal ?? ""}
        placeholder="O que o corredor relata sentir, com as palavras dele."
        required
      />

      <Textarea
        name="historicoSubjetivo"
        label="Histórico subjetivo"
        defaultValue={atendimento.historico_subjetivo ?? prefil?.historicoSubjetivo ?? ""}
        placeholder="Contexto, evolução relatada, fatores relevantes."
      />

      <Textarea
        name="observacoesObjetivas"
        label="Observações objetivas"
        defaultValue={atendimento.observacoes_objetivas ?? ""}
        placeholder="Achados do exame físico, testes realizados nesta avaliação."
      />

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm font-sans text-mid" role="status">
          ✓ Avaliação salva.
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Salvar avaliação
      </Button>
    </form>
  );
}
