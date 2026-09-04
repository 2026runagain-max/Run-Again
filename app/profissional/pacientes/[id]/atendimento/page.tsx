import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/estados/EmptyState";
import { AtendimentoForm } from "@/components/fisioterapia/AtendimentoForm";
import { FinalizarAtendimentoButton } from "@/components/fisioterapia/FinalizarAtendimentoButton";
import { condicaoLabel } from "@/lib/fisioterapia/labels";
import { getAtendimentoAberto, getAtendimentoPorId, getPacienteBasico } from "@/lib/fisioterapia/queries";
import { gerarPrefilAtendimento, type PrefilAtendimento } from "@/lib/fisioterapia/prefil-atendimento";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";

export const metadata: Metadata = { title: "Atendimento — Run Again" };

export default async function AtendimentoPage({
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

  const aberto = await getAtendimentoAberto(id);
  const atendimento = aberto ?? (atendimentoId ? await getAtendimentoPorId(atendimentoId) : null);

  // RF01 — só sugere prefil quando o atendimento ainda não tem nada digitado
  // (RF01-CA3: sem diagnóstico ou já com dado salvo, comporta-se como
  // sempre se comportou: formulário parte do que já existe no atendimento).
  let prefil: PrefilAtendimento | undefined;
  if (atendimento && atendimento.status === "em_andamento" && !atendimento.queixa_principal) {
    const avaliacao = await getAvaliacaoAtual(id);
    if (avaliacao?.concluida_em) {
      prefil = gerarPrefilAtendimento(avaliacao);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          ATENDIMENTO
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
      </div>

      {!atendimento ? (
        <EmptyState
          subtitulo="Nenhum atendimento em andamento pra este paciente."
          ctaLabel="Voltar ao prontuário"
          ctaHref={`/profissional/pacientes/${id}`}
        />
      ) : atendimento.status === "finalizado" ? (
        <Card variant="pillar" className="flex flex-col gap-3">
          <p className="text-sm font-sans text-mid">
            Este atendimento já foi finalizado — os dados abaixo são somente leitura.
          </p>
          {atendimento.condicao_principal && (
            <p className="text-sm font-sans text-ink">
              <strong>Condição:</strong> {condicaoLabel[atendimento.condicao_principal]}
            </p>
          )}
          <p className="text-sm font-sans text-ink">
            <strong>Queixa principal:</strong> {atendimento.queixa_principal}
          </p>
          {atendimento.historico_subjetivo && (
            <p className="text-sm font-sans text-ink">
              <strong>Histórico subjetivo:</strong> {atendimento.historico_subjetivo}
            </p>
          )}
          {atendimento.observacoes_objetivas && (
            <p className="text-sm font-sans text-ink">
              <strong>Observações objetivas:</strong> {atendimento.observacoes_objetivas}
            </p>
          )}
          <Button href={`/profissional/pacientes/${id}`} variant="ghost" className="self-start border-ink text-ink hover:bg-ink/5">
            Voltar ao prontuário
          </Button>
        </Card>
      ) : (
        <>
          <Card variant="pillar">
            <AtendimentoForm atendimento={atendimento} pacienteId={id} prefil={prefil} />
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button href={`/profissional/pacientes/${id}/performance`} variant="fire-ghost">
              Ir para performance
            </Button>
            <Button href={`/profissional/pacientes/${id}/sessao`} variant="fire-ghost">
              Ir para sessão
            </Button>
            <FinalizarAtendimentoButton atendimentoId={atendimento.id} pacienteId={id} />
          </div>
        </>
      )}
    </div>
  );
}
