"use client";

import { useRouter } from "next/navigation";
import { ConfirmActionButton } from "@/components/fisioterapia/ConfirmActionButton";
import { finalizarAtendimentoPsicologiaAction } from "@/lib/psicologia/actions-profissional";

/** RF-5-CA1 — confirmação em modal próprio, nunca window.confirm nativo. */
export function FinalizarAtendimentoPsicologiaButton({
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
      confirmCorpo="Depois de finalizado, o atendimento fecha e vira histórico no prontuário. Você pode iniciar um novo atendimento a qualquer momento."
      confirmLabel="Finalizar"
      atualizarAoConcluir={false}
      action={() => finalizarAtendimentoPsicologiaAction(atendimentoId, pacienteId)}
      onSucesso={() => router.push(`/profissional/pacientes/${pacienteId}/psicologia`)}
    />
  );
}
