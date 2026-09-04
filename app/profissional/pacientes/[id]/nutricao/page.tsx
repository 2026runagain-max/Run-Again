import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AjusteOrientacaoForm } from "@/components/nutricao/profissional/AjusteOrientacaoForm";
import { ResolverSemAjusteButton } from "@/components/nutricao/profissional/ResolverSemAjusteButton";
import { AssumirCasoButton } from "@/components/nutricao/profissional/AssumirCasoButton";
import { getPacienteBasico } from "@/lib/fisioterapia/queries";
import {
  getAvaliacaoNutricionalAtual,
  getCasoPorId,
  getDadosTreinoFluxo2,
  getHistoricoOrientacoes,
  getOrientacaoVigente,
  getRegistrosAlimentares,
} from "@/lib/nutricao/queries";
import {
  desconfortoGiLabel,
  nivelAutomacaoLabel,
  objetivoNutricionalLabel,
  origemOrientacaoLabel,
  padraoAlimentarLabel,
  tipoDiaLabel,
} from "@/lib/nutricao/labels";
import { copyProntuarioNutricao } from "@/lib/nutricao/copy";
import { labelPersona } from "@/lib/labels";
import type { Persona } from "@/lib/types";

export const metadata: Metadata = { title: "Nutrição — Prontuário — Run Again" };

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ProntuarioNutricaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ casoId?: string }>;
}) {
  const { id } = await params;
  const { casoId } = await searchParams;

  const paciente = await getPacienteBasico(id);
  if (!paciente) notFound();

  const [avaliacao, orientacaoVigente, historico, dadosTreino, registros, caso] = await Promise.all([
    getAvaliacaoNutricionalAtual(id),
    getOrientacaoVigente(id),
    getHistoricoOrientacoes(id),
    getDadosTreinoFluxo2(id),
    getRegistrosAlimentares(id, 10),
    casoId ? getCasoPorId(casoId) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">NUTRIÇÃO ESPORTIVA</p>
        <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
        {paciente.persona && <p className="text-sm font-sans text-mid">{labelPersona[paciente.persona as Persona]}</p>}
      </div>

      {!avaliacao ? (
        <Card variant="pillar">
          <p className="text-sm font-sans text-mid">{copyProntuarioNutricao.semAvaliacao}</p>
        </Card>
      ) : (
        <>
          <Card variant="pillar" className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-ink">Perfil e volume de treino</h2>
            <div className="grid grid-cols-1 gap-3 text-sm font-sans sm:grid-cols-2">
              <p className="text-ink">
                <span className="text-mid">Objetivo declarado no Fluxo 2: </span>
                {dadosTreino.objetivoPrincipal ?? "—"}
              </p>
              <p className="text-ink">
                <span className="text-mid">Frequência semanal: </span>
                {dadosTreino.frequenciaSemanal ?? "—"}
              </p>
              <p className="text-ink">
                <span className="text-mid">Volume atual (km): </span>
                {dadosTreino.volumeAtualKm ?? "—"}
              </p>
              {avaliacao.respostas.blocoObjetivo && (
                <p className="text-ink">
                  <span className="text-mid">Objetivo nutricional: </span>
                  {objetivoNutricionalLabel[avaliacao.respostas.blocoObjetivo.objetivoNutricional]}
                </p>
              )}
              {avaliacao.respostas.blocoAlimentar && (
                <p className="text-ink">
                  <span className="text-mid">Padrão alimentar: </span>
                  {padraoAlimentarLabel[avaliacao.respostas.blocoAlimentar.padraoAlimentar]}
                </p>
              )}
              {avaliacao.respostas.blocoDigestivo && (
                <p className="text-ink">
                  <span className="text-mid">Desconforto GI na corrida: </span>
                  {desconfortoGiLabel[avaliacao.respostas.blocoDigestivo.desconfortoGiCorrida]}
                </p>
              )}
            </div>
            {avaliacao.ultimo_nivel_automacao && (
              <div className="flex flex-wrap items-center gap-2 border-t border-mid/10 pt-3">
                <Badge>{nivelAutomacaoLabel[avaliacao.ultimo_nivel_automacao].toUpperCase()}</Badge>
                {avaliacao.ultima_triagem_flags.map((f) => (
                  <span key={f} className="text-xs font-sans text-mid">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {caso && (caso.status === "aberto" || caso.status === "em_atendimento") && (
            <Card variant="insight" className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl text-ink">Caso {caso.tipo === "seguranca" ? "de segurança" : "de revisão"} aberto</h2>
                {caso.status === "aberto" && <AssumirCasoButton casoId={caso.id} />}
              </div>
              <p className="text-sm font-sans text-ink">{caso.motivo}</p>
              <AjusteOrientacaoForm casoId={caso.id} pacienteId={id} tipo={caso.tipo} orientacaoAtual={orientacaoVigente} />
              <ResolverSemAjusteButton casoId={caso.id} />
            </Card>
          )}

          <Card variant="pillar" className="flex flex-col gap-3">
            <h2 className="font-display text-xl text-ink">Orientação vigente</h2>
            {!orientacaoVigente ? (
              <p className="text-sm font-sans text-mid">{copyProntuarioNutricao.semOrientacao}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{origemOrientacaoLabel[orientacaoVigente.origem].toUpperCase()}</Badge>
                  <span className="text-xs font-sans text-mid">versão {orientacaoVigente.versao} · {formatarData(orientacaoVigente.criado_em)}</span>
                </div>
                {orientacaoVigente.energia && (
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(orientacaoVigente.energia.porTipoDia) as (keyof typeof orientacaoVigente.energia.porTipoDia)[]).map((tipo) => (
                      <div key={tipo}>
                        <p className="text-xs font-sans text-mid">{tipoDiaLabel[tipo]}</p>
                        <p className="font-display text-2xl text-ink">{orientacaoVigente.energia!.porTipoDia[tipo]} kcal</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>

          {historico.length > 1 && (
            <Card variant="pillar" className="flex flex-col gap-2">
              <h2 className="font-display text-xl text-ink">Histórico de versões</h2>
              <ul className="flex flex-col gap-2">
                {historico.map((o) => (
                  <li key={o.id} className="flex items-center justify-between text-sm font-sans">
                    <span className="text-ink">
                      Versão {o.versao} — {origemOrientacaoLabel[o.origem]}
                    </span>
                    <span className="text-mid">{formatarData(o.criado_em)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {registros.length > 0 && (
            <Card variant="pillar" className="flex flex-col gap-2">
              <h2 className="font-display text-xl text-ink">Registro alimentar recente</h2>
              <ul className="flex flex-col gap-1.5">
                {registros.map((r) => (
                  <li key={r.id} className="text-sm font-sans text-ink">
                    {r.nome_alimento} <span className="text-mid">— {formatarData(r.registrado_em)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
