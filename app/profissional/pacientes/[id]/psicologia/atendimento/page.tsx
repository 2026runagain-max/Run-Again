import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/estados/EmptyState";
import { AtendimentoPsicologiaForm } from "@/components/psicologia/AtendimentoPsicologiaForm";
import { FinalizarAtendimentoPsicologiaButton } from "@/components/psicologia/FinalizarAtendimentoPsicologiaButton";
import { getPacienteBasico } from "@/lib/fisioterapia/queries";
import {
  getAtendimentoAbertoPsicologia,
  getAtendimentoPsicologiaPorId,
} from "@/lib/psicologia/queries";

export const metadata: Metadata = { title: "Atendimento — Psicologia do Esporte — Run Again" };

export default async function AtendimentoPsicologiaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ atendimentoId?: string }>;
}) {
  const { id } = await params;
  const { atendimentoId } = await searchParams;

  const paciente = await getPacienteBasico(id);
  if (!paciente) notFound();

  const aberto = await getAtendimentoAbertoPsicologia(id);
  const atendimento = aberto ?? (atendimentoId ? await getAtendimentoPsicologiaPorId(atendimentoId) : null);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          ATENDIMENTO — PSICOLOGIA DO ESPORTE
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
      </div>

      {!atendimento ? (
        <EmptyState
          subtitulo="Nenhum atendimento em andamento pra este paciente."
          ctaLabel="Voltar ao prontuário"
          ctaHref={`/profissional/pacientes/${id}/psicologia`}
        />
      ) : atendimento.status === "finalizado" ? (
        <Card variant="pillar" className="flex flex-col gap-3">
          <p className="text-sm font-sans text-mid">
            Este atendimento já foi finalizado — os dados abaixo são somente leitura.
          </p>
          <p className="text-sm font-sans text-ink">
            <strong>O que conversamos:</strong> {atendimento.queixa_principal}
          </p>
          {atendimento.historico_subjetivo && (
            <p className="text-sm font-sans text-ink">
              <strong>Evolução e decisão:</strong> {atendimento.historico_subjetivo}
            </p>
          )}
          {atendimento.observacoes_objetivas && (
            <p className="text-sm font-sans text-ink">
              <strong>Plano:</strong> {atendimento.observacoes_objetivas}
            </p>
          )}
          <Button
            href={`/profissional/pacientes/${id}/psicologia`}
            variant="ghost"
            className="self-start border-ink text-ink hover:bg-ink/5"
          >
            Voltar ao prontuário
          </Button>
        </Card>
      ) : (
        <>
          <Card variant="pillar">
            <AtendimentoPsicologiaForm atendimento={atendimento} pacienteId={id} />
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <FinalizarAtendimentoPsicologiaButton atendimentoId={atendimento.id} pacienteId={id} />
          </div>
        </>
      )}
    </div>
  );
}
