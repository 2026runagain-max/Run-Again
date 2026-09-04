"use client";

import { useActionState } from "react";
import { Button, Select, Textarea } from "@/components/ui";
import { registrarCheckinNutricaoAction } from "@/lib/nutricao/actions";
import { adesaoPercebidaLabel } from "@/lib/nutricao/labels";
import type { AdesaoPercebidaNutricao } from "@/lib/nutricao/types";

const ADESOES = Object.keys(adesaoPercebidaLabel) as AdesaoPercebidaNutricao[];

function Escala0a10({ name, label }: { name: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium font-sans text-ink">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          type="range"
          min={0}
          max={10}
          step={1}
          defaultValue={5}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-smoke accent-fire"
          onInput={(e) => {
            const output = e.currentTarget.nextElementSibling as HTMLOutputElement | null;
            if (output) output.value = e.currentTarget.value;
          }}
        />
        <output htmlFor={name} className="w-6 text-center font-display text-xl text-fire-text">
          5
        </output>
      </div>
    </div>
  );
}

/**
 * M10 (RF08) — alimenta o monitoramento que decide quando a nutricionista
 * precisa entrar. Nunca obrigatório, nunca aparece como cobrança de adesão
 * (regra §6: investigação de barreira antes de qualquer sugestão de
 * mudança) — por isso o formulário nunca julga a resposta, só recolhe.
 */
export function CheckinNutricaoForm() {
  const [state, formAction, pending] = useActionState(registrarCheckinNutricaoAction, null);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-mid/15 bg-white p-6 text-center">
        <p className="font-sans text-sm text-mid">✓ Registrado. Obrigado — isso ajuda a acompanhar como sua orientação está funcionando na prática.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-mid/15 bg-white p-6">
      <div>
        <h2 className="font-display text-xl text-ink">Como está indo?</h2>
        <p className="mt-1 text-sm font-sans text-mid">Poucas perguntas — ajuda a ajustar sua orientação se algo não estiver funcionando.</p>
      </div>

      <Escala0a10 name="fomeNivel" label="Nível de fome nos últimos dias (0 = nenhuma, 10 = extrema)" />
      <Escala0a10 name="energiaNivel" label="Nível de energia (0 = exausto, 10 = cheio de energia)" />
      <Escala0a10 name="desconfortoGi" label="Desconforto digestivo (0 = nenhum, 10 = intenso)" />

      <Select name="adesaoPercebida" label="Como foi seguir sua orientação?" defaultValue="consegui_seguir">
        {ADESOES.map((a) => (
          <option key={a} value={a}>
            {adesaoPercebidaLabel[a]}
          </option>
        ))}
      </Select>

      <Textarea name="observacao" label="Quer contextualizar? (opcional)" placeholder="Opcional." />

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Enviar
      </Button>
    </form>
  );
}
