import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ZonaBadge } from "@/components/fisioterapia/ZonaBadge";
import { IniciarAtendimentoPsicologiaButton } from "@/components/psicologia/IniciarAtendimentoPsicologiaButton";
import { getPacienteBasico } from "@/lib/fisioterapia/queries";
import { cargaVidaLabel } from "@/lib/fisioterapia/labels";
import { labelPersona } from "@/lib/labels";
import type { Persona } from "@/lib/types";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";
import {
  getAtendimentoAbertoPsicologia,
  getCargaVidaAtual,
  getCheckinsDoCorredor,
  getResumoContinuidade,
  getTimelineAtendimentosPsicologia,
  marcarCheckinsRevisados,
} from "@/lib/psicologia/queries";

export const metadata: Metadata = { title: "Prontuário — Psicologia do Esporte — Run Again" };

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProntuarioPsicologiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const paciente = await getPacienteBasico(id);
  if (!paciente) notFound();

  // RF-3-CA2 — abrir o prontuário marca o texto livre pendente como
  // revisado (efeito colateral silencioso, mesmo padrão de
  // sincronizarComVolumeDeTreinoAction em lib/nutricao/actions.ts).
  await marcarCheckinsRevisados(id);

  const [checkins, continuidade, aberto, timelineAtendimentos, avaliacao] = await Promise.all([
    getCheckinsDoCorredor(id),
    getResumoContinuidade(id),
    getAtendimentoAbertoPsicologia(id),
    getTimelineAtendimentosPsicologia(id),
    getAvaliacaoAtual(id),
  ]);

  const cargaVida = await getCargaVidaAtual(id, avaliacao);

  // RF-5-CA1 — timeline mista: check-ins automáticos + atendimentos
  // registrados, ordenados cronologicamente.
  type EventoTimeline =
    | { tipo: "checkin"; data: string; checkin: (typeof checkins)[number] }
    | { tipo: "atendimento"; data: string; atendimento: (typeof timelineAtendimentos)[number] };

  const timeline: EventoTimeline[] = [
    ...checkins.map((c): EventoTimeline => ({ tipo: "checkin", data: c.criado_em, checkin: c })),
    ...timelineAtendimentos.map((a): EventoTimeline => ({ tipo: "atendimento", data: a.iniciado_em, atendimento: a })),
  ].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          PSICOLOGIA DO ESPORTE
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
        {paciente.persona && <p className="text-sm font-sans text-mid">{labelPersona[paciente.persona as Persona]}</p>}
      </div>

      <Button href={`/profissional/pacientes/${id}`} variant="fire-ghost" className="self-start">
        Ver prontuário de fisioterapia
      </Button>

      {/* RF-5-CA2 — card de continuidade: número de check-ins, confiança do
          primeiro ao mais recente, zona atual, texto livre não revisado. */}
      <Card variant="pillar" className="flex flex-col gap-3">
        {continuidade.totalCheckins === 0 ? (
          <p className="text-sm font-sans text-mid">Ainda não há check-in periódico registrado.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Check-ins</p>
              <p className="font-display text-2xl text-ink">{continuidade.totalCheckins}</p>
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Confiança (1º → atual)</p>
              <p className="font-display text-2xl text-ink">
                {continuidade.confiancaPrimeira} → {continuidade.confiancaMaisRecente}
              </p>
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Zona atual</p>
              {continuidade.zonaAtual && <ZonaBadge zona={continuidade.zonaAtual} />}
            </div>
            {/* Regra §6 do PRD — carga de vida mais recente ao lado da zona
                psicológica, leitura de contexto já existente, nunca somada
                automaticamente: o profissional lê os dois e decide. */}
            {cargaVida && (
              <div>
                <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Carga de vida</p>
                <p className="font-sans text-sm text-ink">{cargaVidaLabel[cargaVida]}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-mid/10 pt-3">
          {aberto ? (
            <>
              <Badge>ATENDIMENTO EM ANDAMENTO</Badge>
              <Button
                href={`/profissional/pacientes/${id}/psicologia/atendimento?atendimentoId=${aberto.id}`}
                variant="primary"
              >
                Continuar atendimento
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm font-sans text-mid">Nenhum atendimento em andamento no momento.</p>
              <IniciarAtendimentoPsicologiaButton pacienteId={id} />
            </>
          )}
        </div>
      </Card>

      <Card variant="pillar" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-sm font-sans text-mid">Nenhum check-in ou atendimento registrado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {timeline.map((evento) =>
              evento.tipo === "checkin" ? (
                <li
                  key={`checkin-${evento.checkin.id}`}
                  className="flex flex-col gap-1 border-b border-mid/10 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-sans text-mid">{formatarData(evento.checkin.criado_em)}</span>
                    <Badge>CHECK-IN</Badge>
                    <ZonaBadge zona={evento.checkin.zona} />
                    {evento.checkin.c5_quer_conversar && <Badge>PEDIU CONVERSAR</Badge>}
                  </div>
                  <p className="text-sm font-sans text-ink">
                    Confiança {evento.checkin.c1_confianca}/10 · Medo {evento.checkin.c2_medo}/10
                    {evento.checkin.c3_disposicao !== null && ` · Disposição ${evento.checkin.c3_disposicao}/10`}
                  </p>
                  {evento.checkin.c4_texto_livre && (
                    <p className="text-sm font-sans italic text-mid">“{evento.checkin.c4_texto_livre}”</p>
                  )}
                </li>
              ) : (
                <li
                  key={`atendimento-${evento.atendimento.id}`}
                  className="flex flex-col gap-1 border-b border-mid/10 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-sans font-semibold text-ink">
                      {formatarData(evento.atendimento.iniciado_em)}
                    </span>
                    <Badge>{evento.atendimento.status === "finalizado" ? "ATENDIMENTO FINALIZADO" : "ATENDIMENTO EM ANDAMENTO"}</Badge>
                  </div>
                  {evento.atendimento.queixa_principal && (
                    <p className="text-sm font-sans text-mid">{evento.atendimento.queixa_principal}</p>
                  )}
                </li>
              ),
            )}
          </ul>
        )}
      </Card>
    </div>
  );
}
