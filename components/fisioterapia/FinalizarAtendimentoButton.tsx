"use client";

import { useRouter } from "next/navigation";
import { ConfirmActionButton } from "@/components/fisioterapia/ConfirmActionButton";
import { finalizarAtendimentoAction } from "@/lib/fisioterapia/actions";

export function FinalizarAtendimentoButton({
  atendimentoId,
  pacienteId,
}: {
  atendimentoId: string;
  pacienteId: string;
}) {
  const router = useRouter();

  return (
    <ConfirmActionButton
      label="Finalizar atendimento"
      variant="ghost"
      className="border-ink text-ink hover:bg-ink/5"
      confirmTitulo="Finalizar este atendimento?"
      confirmCorpo="Depois de finalizado, o atendimento fecha e vira histórico no prontuário. As sessões já criadas continuam existindo e visíveis para o corredor como estavam."
      confirmLabel="Finalizar"
      atualizarAoConcluir={false}
      action={() => finalizarAtendimentoAction(atendimentoId, pacienteId)}
      onSucesso={() => router.push(`/profissional/pacientes/${pacienteId}`)}
    />
  );
}
