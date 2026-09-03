import { capacidadeLabelCorredor, capacidadeLabelProfissional } from "@/lib/fisioterapia/labels";
import type { CapacidadeRadar, RadarCapacidade } from "@/lib/fisioterapia/types";

const ORDEM: CapacidadeRadar[] = [
  "forca",
  "potencia",
  "resistencia_muscular",
  "capacidade_aerobia",
  "amplitude_movimento",
  "controle_motor",
  "equilibrio",
  "estabilidade",
  "mobilidade",
];

const SIZE = 340;
const CENTER = SIZE / 2;
const RAIO = 95;

/** Quebra um rótulo de duas ou mais palavras em até 2 linhas equilibradas —
 * evita que rótulos longos ("Amplitude de movimento (ADM)") colidam com o
 * vizinho ou estourem a borda do SVG nos eixos próximos à lateral. */
function quebrarRotulo(texto: string): string[] {
  const palavras = texto.split(" ");
  if (palavras.length <= 1) return [texto];
  const meio = Math.ceil(palavras.length / 2);
  return [palavras.slice(0, meio).join(" "), palavras.slice(meio).join(" ")];
}

function ponto(scorePct: number, indice: number) {
  const angulo = -Math.PI / 2 + indice * ((2 * Math.PI) / ORDEM.length);
  const r = RAIO * (scorePct / 100);
  return {
    x: CENTER + r * Math.cos(angulo),
    y: CENTER + r * Math.sin(angulo),
  };
}

function pontoRotulo(indice: number) {
  const angulo = -Math.PI / 2 + indice * ((2 * Math.PI) / ORDEM.length);
  const r = RAIO + 44;
  return {
    x: CENTER + r * Math.cos(angulo),
    y: CENTER + r * Math.sin(angulo),
  };
}

export interface RadarCapacidadesProps {
  dados: RadarCapacidade[];
  publico: "profissional" | "corredor";
}

export function RadarCapacidades({ dados, publico }: RadarCapacidadesProps) {
  const labels = publico === "corredor" ? capacidadeLabelCorredor : capacidadeLabelProfissional;
  const scorePorCapacidade = new Map(dados.map((d) => [d.capacidade, d.score]));

  const scores = ORDEM.map((cap) => scorePorCapacidade.get(cap) ?? 0);
  const pontosPoligono = scores.map((s, i) => ponto(s, i));
  const pathPoligono = pontosPoligono.map((p) => `${p.x},${p.y}`).join(" ");

  // Progressive disclosure: pro corredor, uma capacidade sem medição nenhuma
  // não é "dado zerado" — é uma pergunta que ainda não foi feita. A lista só
  // mostra o que já foi medido; o eixo continua no desenho (a forma do
  // radar não quebra), só com o rótulo mais apagado. Pro profissional, a
  // grade completa é uma ferramenta de trabalho — "—" ali é sinal de "falta
  // testar isso", então continua toda visível.
  const capacidadesNaLista = publico === "corredor" ? ORDEM.filter((c) => scorePorCapacidade.has(c)) : ORDEM;
  const faltamMedir = ORDEM.length - capacidadesNaLista.length;

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Radar de capacidades: ${ORDEM.map((c) => `${labels[c]} ${scorePorCapacidade.get(c) ?? "sem medição"}${scorePorCapacidade.has(c) ? " por cento" : ""}`).join(", ")}`}
        className="mx-auto w-full max-w-[300px] sm:mx-0"
      >
        {/* Sem anéis concêntricos de propósito — uma grade de "teia" sugere
            precisão de instrumento que a gente não tem, e é a marca visual
            mais repetida em app de wellness. Os raios bastam pra dar forma. */}
        {ORDEM.map((cap, i) => {
          const p = ponto(100, i);
          // Eixo pontilhado = capacidade que o corredor ainda não teve
          // medida — sinaliza "isso existe, ainda sem dado" sem competir
          // visualmente com o que já foi medido (linha cheia).
          const semDadoParaCorredor = publico === "corredor" && !scorePorCapacidade.has(cap);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="var(--smoke)"
              strokeWidth={1}
              strokeDasharray={semDadoParaCorredor ? "2 3" : undefined}
            />
          );
        })}

        <polygon points={pathPoligono} fill="var(--fire-dim)" stroke="var(--fire)" strokeWidth={2} />

        {pontosPoligono.map((p, i) => {
          const medido = scorePorCapacidade.has(ORDEM[i]);
          if (!medido) return null;
          return <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--fire)" />;
        })}

        {ORDEM.map((cap, i) => {
          const p = pontoRotulo(i);
          const linhas = quebrarRotulo(labels[cap]);
          const offsetInicial = linhas.length > 1 ? -0.5 : 0.32;
          const medido = scorePorCapacidade.has(cap);
          // Rótulos perto da lateral crescem em direção ao centro (não pra
          // fora, onde estourariam a borda do SVG) — só os eixos quase
          // verticais (topo/base) ficam centralizados no ponto. Limiar alto
          // de propósito: puxar os eixos que flanqueiam topo/base pro centro
          // também faria colidir um com o outro.
          const cosAngulo = Math.cos(-Math.PI / 2 + i * ((2 * Math.PI) / ORDEM.length));
          const ancora = cosAngulo > 0.5 ? "end" : cosAngulo < -0.5 ? "start" : "middle";
          return (
            <text
              key={cap}
              x={p.x}
              y={p.y}
              textAnchor={ancora}
              className="font-sans"
              fontSize={10.5}
              fontWeight={600}
              fill={publico === "corredor" && !medido ? "var(--mid)" : "var(--ink)"}
              opacity={publico === "corredor" && !medido ? 0.6 : 1}
            >
              {linhas.map((linha, li) => (
                <tspan key={li} x={p.x} dy={li === 0 ? `${offsetInicial}em` : "1.15em"}>
                  {linha}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      <div className="flex w-full flex-col gap-1 sm:max-w-[220px]">
        <ul className="flex flex-col gap-2">
          {capacidadesNaLista.map((cap) => (
            <li
              key={cap}
              className="flex items-center justify-between border-b border-mid/10 py-1.5 text-sm font-sans"
            >
              <span className="text-ink">{labels[cap]}</span>
              <span className="font-display text-lg text-fire-text">
                {scorePorCapacidade.get(cap) ?? "—"}
              </span>
            </li>
          ))}
        </ul>
        {publico === "corredor" && faltamMedir > 0 && (
          <p className="mt-1 text-xs font-sans text-mid">
            {faltamMedir === 1
              ? "Mais uma capacidade aparece aqui assim que for avaliada."
              : `Mais ${faltamMedir} capacidades aparecem aqui conforme forem avaliadas.`}
          </p>
        )}
      </div>
    </div>
  );
}
