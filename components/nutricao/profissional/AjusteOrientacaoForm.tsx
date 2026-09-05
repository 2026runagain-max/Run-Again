"use client";

import { useActionState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { ajustarOrientacaoRevisaoAction, liberarOrientacaoN4Action } from "@/lib/nutricao/actions-profissional";
import { estadosProfissional } from "@/lib/nutricao/copy";
import type { OrientacaoNutricionalRow } from "@/lib/nutricao/types";

export function AjusteOrientacaoForm({
  casoId,
  pacienteId,
  tipo,
  orientacaoAtual,
}: {
  casoId: string;
  pacienteId: string;
  tipo: "seguranca" | "revisao";
  orientacaoAtual: OrientacaoNutricionalRow | null;
}) {
  const acao = tipo === "seguranca" ? liberarOrientacaoN4Action.bind(null, casoId, pacienteId) : ajustarOrientacaoRevisaoAction.bind(null, casoId, pacienteId);
  const [state, formAction, pending] = useActionState(acao, null);

  const macrosAtuais = orientacaoAtual?.macros?.porTipoDia.treino_leve;
  const energiaAtual = orientacaoAtual?.energia?.porTipoDia;

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-mid/15 bg-white p-6 text-center">
        <p className="font-sans text-sm text-mid">✓ {estadosProfissional.sucessoAjusteSalvo}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-mid/15 bg-white p-6">
      <div>
        <h2 className="font-display text-xl text-ink">{tipo === "seguranca" ? "Definir orientação" : "Ajustar orientação"}</h2>
        <p className="mt-1 text-sm font-sans text-mid">
          {tipo === "seguranca"
            ? "Nenhum número foi calculado automaticamente para este caso — defina a orientação a partir da sua avaliação."
            : "A orientação calculada abaixo já reflete o histórico do corredor — ajuste o que for necessário."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          name="energiaTreinoLeveKcal"
          type="number"
          label="Energia — dia leve (kcal)"
          defaultValue={energiaAtual?.treino_leve}
          required
        />
        <Input
          name="energiaTreinoLongoKcal"
          type="number"
          label="Energia — dia longo/intenso (kcal)"
          defaultValue={energiaAtual?.treino_longo_ou_intenso}
          required
        />
        <Input
          name="energiaDescansoKcal"
          type="number"
          label="Energia — descanso (kcal)"
          defaultValue={energiaAtual?.descanso}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input name="carboidratoG" type="number" label="Carboidrato (g)" defaultValue={macrosAtuais?.carboidratoG} required />
        <Input name="proteinaG" type="number" label="Proteína (g)" defaultValue={macrosAtuais?.proteinaG} required />
        <Input name="gorduraG" type="number" label="Gordura (g)" defaultValue={macrosAtuais?.gorduraG} required />
      </div>

      <Textarea
        name="explicacao"
        label="Explicação (exibida ao lado dos números pro corredor)"
        placeholder="Nunca um número isolado — explica o porquê em linguagem direta e humana."
        required
      />

      <Textarea name="observacoesInternas" label="Observações internas (opcional, não vai pro corredor)" />

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Salvar e liberar para o corredor
      </Button>
    </form>
  );
}
