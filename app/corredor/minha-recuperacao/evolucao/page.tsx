import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { RadarCapacidades } from "@/components/fisioterapia/RadarCapacidades";
import { InsightCard } from "@/components/fisioterapia/InsightCard";
import { gerarInsight } from "@/lib/fisioterapia/insight";
import { capacidadeLabelCorredor } from "@/lib/fisioterapia/labels";
import {
  getAssimetrias,
  getEvolucoes,
  getPerfilCorredorPrescricao,
  getRadar,
} from "@/lib/fisioterapia/queries";
import { corredorCopy } from "@/lib/fisioterapia/copy";
import { elegibilidadeInsight } from "@/lib/comunidade/calculo";
import { aindaNaoCompartilhada, getChavesJaCompartilhadas } from "@/lib/comunidade/queries";

export const metadata: Metadata = { title: "Minha Evolução — Run Again" };

export default async function MinhaEvolucaoPage() {
  const perfil = await getPerfilCorredorPrescricao();
  if (!perfil) return null;

  const [radar, evolucoes, assimetrias] = await Promise.all([
    getRadar(perfil.id),
    getEvolucoes(perfil.id),
    getAssimetrias(perfil.id),
  ]);

  const temDadoComparavel = evolucoes.some((e) => e.total_medicoes >= 2);

  if (radar.length === 0 || !temDadoComparavel) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
            MINHA EVOLUÇÃO
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">O que já mudou</h1>
        </div>
        <Card variant="pillar" className="p-8 text-center">
          <p className="font-sans text-sm text-mid">{corredorCopy.vazioEvolucao}</p>
        </Card>
        {radar.length > 0 && (
          <Card variant="pillar">
            <RadarCapacidades dados={radar} publico="corredor" />
          </Card>
        )}
      </div>
    );
  }

  // RF-J2/CA1: nunca mais de uma frase de insight por visita — a função só
  // retorna um resultado.
  const insight = gerarInsight(evolucoes, assimetrias);

  // RF01 da Comunidade — convite inline, mesma leitura combinada em
  // components/painel/CardRisco.tsx e nas outras 2 do painel.
  const jaCompartilhadas = await getChavesJaCompartilhadas(perfil.id);
  const compartilharInsight = aindaNaoCompartilhada(elegibilidadeInsight(insight), jaCompartilhadas, "insight");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          MINHA EVOLUÇÃO
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">O que já mudou</h1>
      </div>

      {insight && <InsightCard insight={insight} compartilhar={compartilharInsight} />}

      <Card variant="pillar">
        <RadarCapacidades dados={radar} publico="corredor" />
        <p className="mt-4 text-xs font-sans text-mid">
          Cada número é o percentual da sua meta clínica — definida com o profissional que acompanha seu
          retorno — não uma comparação com outras pessoas.
        </p>
      </Card>

      {assimetrias.length > 0 && (
        <Card variant="pillar" className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-ink">Equilíbrio entre os lados</h2>
          <ul className="flex flex-col gap-2">
            {assimetrias.map((a) => (
              <li
                key={`${a.capacidade}-${a.nome}`}
                className="flex items-center justify-between border-b border-mid/10 py-2 text-sm font-sans"
              >
                <span className="text-ink">
                  {a.nome}
                  <span className="block text-xs text-mid">{capacidadeLabelCorredor[a.capacidade]}</span>
                </span>
                <span className="font-display text-lg text-fire-text">{a.assimetria_pct}%</span>
              </li>
            ))}
          </ul>
          <p className="text-xs font-sans text-mid">
            Diferença entre a perna esquerda e a direita no mesmo teste — quanto menor, mais equilibrado.
          </p>
        </Card>
      )}
    </div>
  );
}
