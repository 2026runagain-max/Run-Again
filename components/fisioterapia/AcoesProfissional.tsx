"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  criarSessaoComFocoAtualAction,
  criarSessaoManualAction,
  iniciarAtendimentoAction,
} from "@/lib/fisioterapia/actions";

function useAcaoComRedirecionamento() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function executar(acao: () => Promise<{ ok: boolean; erro?: string; data?: unknown }>, destino: (data: unknown) => string) {
    setErro(null);
    startTransition(async () => {
      const resultado = await acao();
      if (!resultado.ok) {
        setErro(resultado.erro ?? "Não foi possível concluir agora. Tenta de novo.");
        return;
      }
      router.push(destino(resultado.data));
    });
  }

  return { executar, pending, erro };
}

export function IniciarAtendimentoButton({ pacienteId }: { pacienteId: string }) {
  const { executar, pending, erro } = useAcaoComRedirecionamento();

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        loading={pending}
        onClick={() =>
          executar(
            () => iniciarAtendimentoAction(pacienteId),
            (data) => `/profissional/pacientes/${pacienteId}/atendimento?atendimentoId=${(data as { atendimentoId: string }).atendimentoId}`,
          )
        }
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

export function CriarSessaoFocoButton({
  pacienteId,
  atendimentoId,
}: {
  pacienteId: string;
  atendimentoId: string;
}) {
  const { executar, pending, erro } = useAcaoComRedirecionamento();

  return (
    <div>
      <Button
        type="button"
        variant="primary"
        loading={pending}
        onClick={() =>
          executar(
            () => criarSessaoComFocoAtualAction(pacienteId, atendimentoId),
            (data) => `/profissional/pacientes/${pacienteId}/sessao?sessaoId=${(data as { sessaoId: string }).sessaoId}`,
          )
        }
      >
        Criar sessão com foco atual
      </Button>
      {erro && (
        <p className="mt-2 text-sm font-sans text-fire-text" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

export function CriarSessaoManualButton({
  pacienteId,
  atendimentoId,
}: {
  pacienteId: string;
  atendimentoId: string;
}) {
  const { executar, pending, erro } = useAcaoComRedirecionamento();

  return (
    <div>
      <Button
        type="button"
        variant="fire-ghost"
        loading={pending}
        onClick={() =>
          executar(
            () => criarSessaoManualAction(pacienteId, atendimentoId),
            (data) => `/profissional/pacientes/${pacienteId}/sessao?sessaoId=${(data as { sessaoId: string }).sessaoId}`,
          )
        }
      >
        Montar sessão manualmente
      </Button>
      {erro && (
        <p className="mt-2 text-sm font-sans text-fire-text" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
