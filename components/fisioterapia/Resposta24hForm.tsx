"use client";

import { useActionState } from "react";
import { Button, Select, Textarea } from "@/components/ui";
import { registrarResposta24hAction } from "@/lib/fisioterapia/actions-corredor";
import { cargaVidaLabel, funcaoDiaSeguinteLabel } from "@/lib/fisioterapia/labels";
import type { CargaVida, FuncaoDiaSeguinte } from "@/lib/fisioterapia/types";
import { corredorCopy } from "@/lib/fisioterapia/copy";

const FUNCOES = Object.keys(funcaoDiaSeguinteLabel) as FuncaoDiaSeguinte[];
const CARGAS = Object.keys(cargaVidaLabel) as CargaVida[];

function EscalaDor({ name, label, hint }: { name: string; label: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium font-sans text-ink">
        {label}
        <span className="ml-1 font-normal text-mid">{hint}</span>
      </label>
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          type="range"
          min={0}
          max={10}
          step={1}
          defaultValue={0}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-smoke accent-fire"
          onInput={(e) => {
            const output = e.currentTarget.nextElementSibling as HTMLOutputElement | null;
            if (output) output.value = e.currentTarget.value;
          }}
        />
        <output htmlFor={name} className="w-6 text-center font-display text-xl text-fire-text">
          0
        </output>
      </div>
    </div>
  );
}

export function Resposta24hForm({
  sessaoId,
  jaRespondida = false,
}: {
  sessaoId: string;
  jaRespondida?: boolean;
}) {
  const acaoLigada = registrarResposta24hAction.bind(null, sessaoId);
  const [state, formAction, pending] = useActionState(acaoLigada, null);

  if (state?.ok || jaRespondida) {
    return (
      <div className="rounded-2xl border border-mid/15 bg-white p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-4 font-sans text-sm text-mid">
          {state?.ok ? corredorCopy.sucessoResposta24h : "Você já registrou como foi essa sessão. Obrigado — isso já está com quem cuida do seu retorno."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-mid/15 bg-white p-6">
      <div>
        <h2 className="font-display text-2xl text-ink">Como foi?</h2>
        <p className="mt-1 text-sm font-sans text-mid">
          Quatro perguntas rápidas — isso ajusta o seu protocolo pra próxima sessão.
        </p>
      </div>

      <EscalaDor
        name="dorDurante"
        label="Dor durante a sessão"
        hint="(0 = nenhuma dor, 10 = a pior dor possível)"
      />
      <EscalaDor
        name="esforcoPercebido"
        label="Esforço percebido"
        hint="(0 = nenhum esforço, 10 = o esforço máximo possível)"
      />
      <EscalaDor
        name="dor24h"
        label="Dor 24h depois"
        hint="(0 = nenhuma dor, 10 = a pior dor possível)"
      />

      <Select name="funcaoDiaSeguinte" label="Como você acordou no dia seguinte?" defaultValue="normal" required>
        {FUNCOES.map((f) => (
          <option key={f} value={f}>
            {funcaoDiaSeguinteLabel[f]}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-3 border-t border-mid/10 pt-4">
        <Select
          name="cargaVidaPercebida"
          label="Carga de vida (opcional)"
          hint="Como tem estado sua rotina fora do treino — trabalho, sono, estresse."
          defaultValue=""
        >
          <option value="">Prefiro não dizer</option>
          {CARGAS.map((c) => (
            <option key={c} value={c}>
              {cargaVidaLabel[c]}
            </option>
          ))}
        </Select>
        <Textarea
          name="cargaVidaObservacao"
          label="Quer contextualizar?"
          placeholder="Opcional."
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Enviar resposta
      </Button>
    </form>
  );
}
