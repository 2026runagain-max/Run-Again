"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@/components/ui";
import { registrarTesteAction } from "@/lib/fisioterapia/actions";
import { capacidadeLabelProfissional, ladoLabel } from "@/lib/fisioterapia/labels";
import type { CapacidadeRadar, LadoCorpo } from "@/lib/fisioterapia/types";

const CAPACIDADES = Object.keys(capacidadeLabelProfissional) as CapacidadeRadar[];
const LADOS = Object.keys(ladoLabel) as LadoCorpo[];

export function TesteForm({
  pacienteId,
  atendimentoId,
}: {
  pacienteId: string;
  atendimentoId: string | null;
}) {
  const acaoLigada = registrarTesteAction.bind(null, pacienteId, atendimentoId);
  const [state, formAction, pending] = useActionState(acaoLigada, null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      // Radar e tabela de evolução vivem no Server Component pai — precisam
      // ser buscados de novo pra refletir o teste recém-registrado.
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <Select name="capacidade" label="Capacidade" defaultValue="forca" required>
        {CAPACIDADES.map((c) => (
          <option key={c} value={c}>
            {capacidadeLabelProfissional[c]}
          </option>
        ))}
      </Select>

      <Input name="nome" label="Nome do teste" placeholder="Ex.: Força de posterior de coxa" required />

      <div className="grid grid-cols-2 gap-4">
        <Input name="unidade" label="Unidade" placeholder="kg, repetições, s..." required />
        <Select name="lado" label="Lado" defaultValue="bilateral" required>
          {LADOS.map((l) => (
            <option key={l} value={l}>
              {ladoLabel[l]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input name="valor" type="number" step="0.1" min="0" label="Valor medido" required />
        <Input
          name="metaClinica"
          type="number"
          step="0.1"
          min="0.1"
          label="Meta clínica"
          hint="Usada pro score 0–100."
          required
        />
      </div>

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Registrar teste
      </Button>
    </form>
  );
}
