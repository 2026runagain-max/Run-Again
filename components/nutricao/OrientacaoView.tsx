import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CardapioEEquivalencias } from "./CardapioEEquivalencias";
import { PedirRevisaoButton } from "./PedirRevisaoButton";
import { origemOrientacaoLabel, tipoDiaLabel } from "@/lib/nutricao/labels";
import { NUTRICIONISTA_RESPONSAVEL_NOME } from "@/lib/nutricao/motor";
import type { OrientacaoNutricionalRow, TipoDia } from "@/lib/nutricao/types";

const TIPOS_DIA: TipoDia[] = ["treino_leve", "treino_longo_ou_intenso", "descanso"];

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function rotuloAutoria(orientacao: OrientacaoNutricionalRow): string {
  if (orientacao.origem === "calculada") {
    return `Calculada a partir das regras clínicas de ${NUTRICIONISTA_RESPONSAVEL_NOME}`;
  }
  const verbo = orientacao.origem === "ajustada_pela_equipe" ? "Ajustada" : "Definida";
  return `${verbo} por ${NUTRICIONISTA_RESPONSAVEL_NOME}`;
}

export function OrientacaoView({ orientacao }: { orientacao: OrientacaoNutricionalRow }) {
  return (
    <div className="flex flex-col gap-6">
      <Card variant="insight" className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{origemOrientacaoLabel[orientacao.origem].toUpperCase()}</Badge>
          <span className="text-xs font-sans text-mid">
            {orientacao.ajustado_em ? `em ${formatarData(orientacao.ajustado_em)}` : `calculada em ${formatarData(orientacao.criado_em)}`}
          </span>
        </div>
        <p className="font-sans text-sm text-ink">{rotuloAutoria(orientacao)}.</p>
      </Card>

      {orientacao.energia && (
        <Card variant="pillar" className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-ink">Sua energia</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TIPOS_DIA.map((tipo) => (
              <div key={tipo} className="rounded-xl border border-mid/15 p-4">
                <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">{tipoDiaLabel[tipo]}</p>
                <p className="mt-1 font-display text-3xl text-ink">{orientacao.energia!.porTipoDia[tipo]} kcal</p>
              </div>
            ))}
          </div>
          <p className="text-sm font-sans text-mid">{orientacao.energia.explicacao}</p>
        </Card>
      )}

      {orientacao.macros && (
        <Card variant="pillar" className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-ink">Seus macronutrientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm font-sans">
              <thead>
                <tr className="border-b border-mid/15 text-xs uppercase tracking-wide text-mid">
                  <th className="py-2 pr-3">Tipo de dia</th>
                  <th className="py-2 pr-3">Carboidrato</th>
                  <th className="py-2 pr-3">Proteína</th>
                  <th className="py-2 pr-3">Gordura</th>
                </tr>
              </thead>
              <tbody>
                {TIPOS_DIA.map((tipo) => {
                  const m = orientacao.macros!.porTipoDia[tipo];
                  return (
                    <tr key={tipo} className="border-b border-mid/10 last:border-0">
                      <td className="py-2 pr-3 text-ink">{tipoDiaLabel[tipo]}</td>
                      <td className="py-2 pr-3 text-ink">{m.carboidratoG} g</td>
                      <td className="py-2 pr-3 text-ink">{m.proteinaG} g</td>
                      <td className="py-2 pr-3 text-ink">{m.gorduraG} g</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm font-sans text-mid">{orientacao.macros.explicacao}</p>
        </Card>
      )}

      {/* Item 15 (feedback da Marina): equivalências e cardápio básico —
          só faz sentido existir quando já há um alvo de macros calculado. */}
      {orientacao.macros && <CardapioEEquivalencias macros={orientacao.macros} />}

      {orientacao.timing && (
        <Card variant="pillar" className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-ink">Quando comer</h2>
          <ul className="flex flex-col gap-3">
            {orientacao.timing.itens.map((item) => (
              <li key={item.titulo} className="border-b border-mid/10 pb-3 last:border-0 last:pb-0">
                <p className="font-sans text-sm font-semibold text-ink">{item.titulo}</p>
                <p className="mt-0.5 text-sm font-sans text-mid">{item.texto}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {orientacao.hidratacao && (
        <Card variant="pillar" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl text-ink">Hidratação</h2>
          <p className="font-display text-3xl text-ink">
            {(orientacao.hidratacao.baseMlDia / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} L
            <span className="ml-2 text-base font-sans font-normal text-mid">base por dia</span>
          </p>
          <p className="text-sm font-sans text-ink">
            + {orientacao.hidratacao.extraPorHoraTreinoMl} ml por hora treinada
          </p>
          <p className="text-sm font-sans text-mid">{orientacao.hidratacao.explicacao}</p>
        </Card>
      )}

      {orientacao.suplementacao && (
        <Card variant="pillar" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl text-ink">Suplementação</h2>
          {orientacao.suplementacao.recomendacoes.length === 0 ? (
            <p className="text-sm font-sans text-ink">Nenhuma suplementação necessária agora.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {orientacao.suplementacao.recomendacoes.map((r) => (
                <li key={r.nome}>
                  <p className="font-sans text-sm font-semibold text-ink">{r.nome}</p>
                  <p className="text-sm font-sans text-mid">{r.motivo}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm font-sans text-mid">{orientacao.suplementacao.explicacao}</p>
        </Card>
      )}

      <PedirRevisaoButton />
    </div>
  );
}
