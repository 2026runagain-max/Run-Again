"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { iniciarAtendimentoPsicologiaAction } from "@/lib/psicologia/actions-profissional";

export function IniciarAtendimentoPsicologiaButton({ pacienteId }: { pacienteId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        loading={pending}
        onClick={() => {
          setErro(null);
          startTransition(async () => {
            const resultado = await iniciarAtendimentoPsicologiaAction(pacienteId);
            if (!resultado.ok) {
              setErro(resultado.erro);
              return;
            }
            router.push(`/profissional/pacientes/${pacienteId}/psicologia/atendimento?atendimentoId=${resultado.data!.atendimentoId}`);
          });
        }}
      >
        Iniciar atendimento
      </Button>
      {erro && (
        <p className="mt-2 text-sm font-sans text-fire-text" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
