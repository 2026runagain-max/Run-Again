import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/estados/EmptyState";
import { SessaoBuilder } from "@/components/fisioterapia/SessaoBuilder";
import { CriarSessaoFocoButton, CriarSessaoManualButton } from "@/components/fisioterapia/AcoesProfissional";
import {
  getAtendimentoAberto,
  getCatalogo,
  getExerciciosDaSessao,
  getPacienteBasico,
  getSessaoPorId,
  getSessoesDoAtendimento,
} from "@/lib/fisioterapia/queries";
import type { ExercicioCatalogo, SessaoExercicioComDetalhe } from "@/lib/fisioterapia/types";

export const metadata: Metadata = { title: "Sessão prescrita — Run Again" };

export default async function SessaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessaoId?: string }>;
}) {
  const { id } = await params;
  const { sessaoId } = await searchParams;

  const paciente = await getPacienteBasico(id);
  if (!paciente) notFound();

  const aberto = await getAtendimentoAberto(id);

  let sessao = sessaoId ? await getSessaoPorId(sessaoId) : null;
  if (!sessao && aberto) {
    const sessoes = await getSessoesDoAtendimento(aberto.id);
    sessao = sessoes[0] ?? null;
  }

  const [exercicios, catalogo]: [SessaoExercicioComDetalhe[], ExercicioCatalogo[]] = sessao
    ? await Promise.all([getExerciciosDaSessao(sessao.id), getCatalogo()])
    : [[], []];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          SESSÃO PRESCRITA
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
      </div>

      {!sessao ? (
        aberto ? (
          <Card variant="pillar" className="flex flex-col items-start gap-4 text-center sm:text-left">
            <p className="text-sm font-sans text-mid">
              Nenhuma sessão criada ainda para este atendimento. Cria a partir do déficit medido no radar, ou
              monta manualmente.
            </p>
            <div className="flex flex-wrap gap-3">
              <CriarSessaoFocoButton pacienteId={id} atendimentoId={aberto.id} />
              <CriarSessaoManualButton pacienteId={id} atendimentoId={aberto.id} />
            </div>
          </Card>
        ) : (
          <EmptyState
            subtitulo="Nenhum atendimento em andamento — inicia um no prontuário antes de montar uma sessão."
            ctaLabel="Voltar ao prontuário"
            ctaHref={`/profissional/pacientes/${id}`}
          />
        )
      ) : (
        <>
          <SessaoBuilder sessao={sessao} exercicios={exercicios} catalogo={catalogo} pacienteId={id} />
          <Button
            href={`/profissional/pacientes/${id}`}
            variant="ghost"
            className="self-start border-ink text-ink hover:bg-ink/5"
          >
            Voltar ao prontuário
          </Button>
        </>
      )}
    </div>
  );
}
