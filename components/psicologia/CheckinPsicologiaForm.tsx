"use client";

import { useActionState } from "react";
import { EscalaSlider } from "@/components/avaliacao/EscalaSlider";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { SuccessState } from "@/components/estados/SuccessState";
import { registrarCheckinPsicologiaAction } from "@/lib/psicologia/actions";
import {
  confirmacaoPorZona,
  confirmacaoPrimeiraVezAtencao,
  confirmacaoPrioridade,
  corredorCopy,
} from "@/lib/psicologia/copy";

/**
 * RF-1 — C1–C5 numa tela só, sem ramificação, sem exigir texto. §2.1/§8 do
 * PRD: mesma tela hospeda os dois estados (formulário e confirmação), e a
 * confirmação varia por zona — nunca genérica (regra §8).
 */
export function CheckinPsicologiaForm({ nomePsicologo }: { nomePsicologo: string }) {
  const [state, formAction, pending] = useActionState(registrarCheckinPsicologiaAction, null);

  if (state?.ok && state.data) {
    const { zona, quisConversar, houveCheckinAnterior } = state.data;
    const confirmacao = quisConversar
      ? confirmacaoPrioridade(nomePsicologo)
      : zona !== "verde" && !houveCheckinAnterior
        ? confirmacaoPrimeiraVezAtencao(nomePsicologo)
        : confirmacaoPorZona[zona](nomePsicologo);
    return (
      <div className="rounded-2xl border border-mid/15 bg-white p-8">
        <SuccessState titulo="Registrado." subtitulo={confirmacao} />
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6 rounded-2xl border border-mid/15 bg-white p-6">
      <EscalaSlider
        name="c1Confianca"
        label="Hoje, o quanto você confia no seu corpo pra treinar?"
        hint="(0 = nada, 10 = totalmente)"
        defaultValue={5}
      />
      <EscalaSlider
        name="c2Medo"
        label="Quanto medo de se lesionar de novo você sente agora?"
        hint="(0 = nenhum, 10 = muito)"
        defaultValue={0}
      />
      <EscalaSlider
        name="c3Disposicao"
        label="Como está sua disposição geral pra treinar essa semana?"
        hint="(opcional)"
        defaultValue={5}
      />

      <Textarea
        name="c4TextoLivre"
        label="Quer contar mais alguma coisa?"
        hint="Opcional — fica à vontade, isso vai direto pra quem te acompanha."
        placeholder="Escreve aqui, se quiser."
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium font-sans text-ink">
          Gostaria de conversar com {nomePsicologo} agora, antes do próximo check-in?
        </legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-sans text-ink">
            <input type="radio" name="c5QuerConversar" value="sim" className="accent-fire" />
            Sim
          </label>
          <label className="flex items-center gap-2 text-sm font-sans text-ink">
            <input type="radio" name="c5QuerConversar" value="nao" defaultChecked className="accent-fire" />
            Não, por enquanto
          </label>
        </div>
      </fieldset>

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Responder agora
      </Button>
      {pending && <p className="sr-only" role="status">{corredorCopy.loading}</p>}
    </form>
  );
}
