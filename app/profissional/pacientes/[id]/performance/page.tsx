import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TesteForm } from "@/components/fisioterapia/TesteForm";
import { RadarCapacidades } from "@/components/fisioterapia/RadarCapacidades";
import { CriarSessaoFocoButton } from "@/components/fisioterapia/AcoesProfissional";
import {
  getAssimetrias,
  getAtendimentoAberto,
  getEvolucoes,
  getPacienteBasico,
  getRadar,
} from "@/lib/fisioterapia/queries";
import { capacidadeLabelProfissional, ladoLabel } from "@/lib/fisioterapia/labels";

export const metadata: Metadata = { title: "Performance — Run Again" };

export default async function PerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const paciente = await getPacienteBasico(id);
  if (!paciente) notFound();

  const [aberto, radar, evolucoes, assimetrias] = await Promise.all([
    getAtendimentoAberto(id),
    getRadar(id),
    getEvolucoes(id),
    getAssimetrias(id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
            PERFORMANCE
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">{paciente.nome}</h1>
        </div>
        {aberto ? (
          <CriarSessaoFocoButton pacienteId={id} atendimentoId={aberto.id} />
        ) : (
          <p className="max-w-xs text-right text-xs font-sans text-mid">
            Inicia um atendimento pra poder criar sessão com foco no déficit atual.
          </p>
        )}
      </div>

      <Card variant="pillar">
        {radar.length === 0 ? (
          <p className="text-sm font-sans text-mid">
            Nenhum teste registrado ainda. Registra o primeiro no formulário abaixo pra o radar aparecer.
          </p>
        ) : (
          <RadarCapacidades dados={radar} publico="profissional" />
        )}
      </Card>

      <Card variant="pillar" className="flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Registrar teste</h2>
        <TesteForm pacienteId={id} atendimentoId={aberto?.id ?? null} />
      </Card>

      {evolucoes.length > 0 && (
        <Card variant="pillar" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-ink">Testes e evolução</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-mid/20 text-xs uppercase tracking-wide text-mid">
                  <th className="py-2 pr-4">Teste</th>
                  <th className="py-2 pr-4">Lado</th>
                  <th className="py-2 pr-4">Valor atual</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Evolução</th>
                </tr>
              </thead>
              <tbody>
                {evolucoes.map((e) => (
                  <tr key={`${e.capacidade}-${e.nome}-${e.lado}`} className="border-b border-mid/10">
                    <td className="py-2 pr-4 text-ink">
                      {e.nome}
                      <span className="block text-xs text-mid">{capacidadeLabelProfissional[e.capacidade]}</span>
                    </td>
                    <td className="py-2 pr-4 text-mid">{ladoLabel[e.lado]}</td>
                    <td className="py-2 pr-4 text-ink">
                      {e.valor_atual} {e.unidade}
                    </td>
                    <td className="py-2 pr-4 font-display text-lg text-fire-text">{e.score}</td>
                    <td className="py-2 pr-4 text-ink">
                      {e.evolucao_pct === null
                        ? "1ª medição"
                        : `${e.evolucao_pct > 0 ? "+" : ""}${e.evolucao_pct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {assimetrias.length > 0 && (
        <Card variant="pillar" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-ink">Assimetria E/D</h2>
          <ul className="flex flex-col gap-2">
            {assimetrias.map((a) => (
              <li key={`${a.capacidade}-${a.nome}`} className="flex items-center justify-between border-b border-mid/10 py-2 text-sm font-sans">
                <span className="text-ink">{a.nome}</span>
                <span className="font-display text-lg text-fire-text">{a.assimetria_pct}%</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Button href={`/profissional/pacientes/${id}`} variant="ghost" className="self-start border-ink text-ink hover:bg-ink/5">
        Voltar ao prontuário
      </Button>
    </div>
  );
}
