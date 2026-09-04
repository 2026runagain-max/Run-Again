"use client";

import { useRouter } from "next/navigation";
import { ConfirmActionButton } from "@/components/fisioterapia/ConfirmActionButton";
import { marcarCasoResolvidoAction } from "@/lib/nutricao/actions-profissional";

/**
 * Fecha um caso sem gerar orientação nova (ex.: triagem revisada e
 * considerada falso positivo). Reaproveita o mesmo componente de modal de
 * confirmação já usado na Fisioterapia — nunca window.confirm.
 */
export function ResolverSemAjusteButton({ casoId }: { casoId: string }) {
  const router = useRouter();

  return (
    <ConfirmActionButton
      label="Resolver sem alterar orientação"
      variant="fire-ghost"
      confirmTitulo="Resolver este caso sem alterar a orientação?"
      confirmCorpo="Isso fecha o caso na fila sem gravar nenhuma orientação nova. Use quando, depois de avaliar, você concluir que nenhuma mudança é necessária."
      confirmLabel="Resolver caso"
      action={() => marcarCasoResolvidoAction(casoId)}
      onSucesso={() => router.push("/profissional/nutricao/casos")}
      atualizarAoConcluir={false}
    />
  );
}
