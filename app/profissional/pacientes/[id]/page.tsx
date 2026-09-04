import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { IniciarAtendimentoButton } from "@/components/fisioterapia/AcoesProfissional";
import { ZonaBadge } from "@/components/fisioterapia/ZonaBadge";
import {
  getAtendimentoAberto,
  getPacienteBasico,
  getRespostas24hDoPaciente,
  getTimelineAtendimentos,
} from "@/lib/fisioterapia/queries";
import { cargaVidaLabel, condicaoLabel } from "@/lib/fisioterapia/labels";
import { labelPersona } from "@/lib/labels";
import type { Persona } from "@/lib/types";
import { getAderenciaResultado } from "@/lib/painel/queries";

export const metadata: Metadata = { title: "Prontuário — Run Again" };

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const paciente = await getPacienteBasico(id);
  if (!paciente) notFound();

  const [aberto, timeline, respostas, aderencia] = await Promise.all([
    getAtendimentoAberto(id),
    getTimelineAtendimentos(id),
    getRespostas24hDoPaciente(id),
    getAderenciaResultado(id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          PRONTUÁRIO
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
        {paciente.persona && (
          <p className="text-sm font-sans text-mid">{labelPersona[paciente.persona as Persona]}</p>
        )}
      </div>

      {/* Card de continuidade — RF-B3 */}
      <Card variant="pillar" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {aberto ? (
          <>
            <div>
              <Badge>ATENDIMENTO EM ANDAMENTO</Badge>
              <p className="mt-2 text-sm font-sans text-mid">
                Iniciado em {formatarData(aberto.iniciado_em)}
                {aberto.condicao_principal && ` · ${condicaoLabel[aberto.condicao_principal]}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href={`/profissional/pacientes/${id}/atendimento?atendimentoId=${aberto.id}`} variant="primary">
                Continuar atendimento
              </Button>
              <Button href={`/profissional/pacientes/${id}/performance`} variant="fire-ghost">
                Performance
              </Button>
              <Button href={`/profissional/pacientes/${id}/sessao`} variant="fire-ghost">
                Sessão
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-sans text-mid">Nenhum atendimento em andamento no momento.</p>
            <IniciarAtendimentoButton pacienteId={id} />
          </>
        )}
      </Card>

      {/* RF12 (SHOULD) — o profissional vê aderência real antes de decidir a
          próxima dose, em vez de precisar perguntar de memória. */}
      {aderencia.ok && aderencia.data && (
        <Card variant="pillar" className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
              Aderência à sessão atual
            </p>
            <p className="mt-1 font-sans text-sm text-ink">
              {aderencia.data.concluidos} de {aderencia.data.prescritos} exercícios marcados como concluídos pelo
              corredor.
            </p>
          </div>
          <p className="font-display text-4xl leading-none text-ink">{aderencia.data.percentual}%</p>
        </Card>
      )}

      {respostas.length > 0 && (
        <Card variant="pillar" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-ink">Últimas respostas de 24h</h2>
          <ul className="flex flex-col gap-3">
            {respostas.slice(0, 5).map((r) => (
              <li key={r.id} className="flex flex-col gap-1 border-b border-mid/10 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-sans text-mid">{formatarData(r.criado_em)}</span>
                  <ZonaBadge zona={r.zona} />
                  {r.carga_vida_percebida && (
                    <Badge>CARGA DE VIDA: {cargaVidaLabel[r.carga_vida_percebida].toUpperCase()}</Badge>
                  )}
                </div>
                <p className="text-sm font-sans text-ink">
                  Dor durante {r.dor_durante}/10 · Esforço {r.esforco_percebido}/10 · Dor 24h {r.dor_24h}/10
                </p>
                {r.carga_vida_observacao && (
                  <p className="text-sm font-sans italic text-mid">“{r.carga_vida_observacao}”</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card variant="pillar" className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-ink">Timeline de atendimentos</h2>
        {timeline.length === 0 ? (
          <p className="text-sm font-sans text-mid">Nenhum atendimento registrado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {timeline.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 border-b border-mid/10 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-sans font-semibold text-ink">{formatarData(a.iniciado_em)}</span>
                  <Badge>{a.status === "finalizado" ? "FINALIZADO" : "EM ANDAMENTO"}</Badge>
                  {a.condicao_principal && (
                    <span className="text-xs font-sans text-mid">{condicaoLabel[a.condicao_principal]}</span>
                  )}
                </div>
                {a.queixa_principal && (
                  <p className="text-sm font-sans text-mid">{a.queixa_principal}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
