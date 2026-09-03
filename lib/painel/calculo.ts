// Cálculos determinísticos do painel de progresso (RF04/RF05/RF06). Mesma
// convenção de lib/avaliacao/diagnostico.ts: sem IA, sem motor Python, mesma
// entrada sempre produz a mesma saída — "mesma classe de decisão já
// validada duas vezes" (regra §5 do PRD de painel).

import { calcularBanda } from "@/lib/avaliacao/diagnostico";
import type { BandaRisco, DesafioRotina } from "@/lib/avaliacao/types";
import type { CargaVida, Resposta24h, ZonaResposta } from "@/lib/fisioterapia/types";
import type { AderenciaResumo, BandaCargaForma, CargaFormaResumo, ResultadoPainel, RiscoResumo } from "./types";

// RF04 — % de exercícios concluídos / prescritos. Nunca exibido sem frase de
// contexto (regra §6.1) — a frase mora em lib/painel/copy.ts, não aqui.
export function calcularAderencia(concluidos: number, prescritos: number): AderenciaResumo {
  const percentual = prescritos === 0 ? 0 : Math.round((concluidos / prescritos) * 100);
  return { concluidos, prescritos, percentual };
}

// Regra §6.4: carga de vida é sempre a fonte mais recente disponível —
// resposta 24h se existir, senão o diagnóstico (Bloco F). Mapeamento
// taxonomia→taxonomia explícito (mesmo padrão de REGIAO_LABEL em
// diagnostico.ts) — nunca correspondência de texto livre. desafioRotina não
// é literalmente "carga de vida", mas é o sinal mais próximo que o Bloco F
// oferece; a ordem abaixo vai do desafio menos ao mais pesado.
const CARGA_VIDA_POR_DESAFIO_ROTINA: Record<DesafioRotina, CargaVida> = {
  nenhum_desafio_grande: "tranquila",
  falta_constancia: "normal",
  falta_lugar_seguro: "normal",
  falta_tempo: "carregada",
  cansaco_estresse: "muito_carregada",
};

export function cargaVidaDoBlocoF(desafioRotina: DesafioRotina | undefined): CargaVida | null {
  if (!desafioRotina) return null;
  return CARGA_VIDA_POR_DESAFIO_ROTINA[desafioRotina];
}

/**
 * RF05 — banda de carga/fadiga/forma: combina carga de vida percebida, RPE
 * (esforço percebido) das últimas sessões e zona predominante da semana.
 * Threshold citado como exemplo no próprio PRD (§5): "2+ zonas amarelas/
 * vermelhas na semana + carga de vida 'carregada' → banda 'atenção'" — os
 * dois sinais contam 1 ponto cada, o que reproduz esse exemplo exatamente
 * (2 sinais = atenção). "muito_carregada" pesa mais que "carregada" (conta
 * como 2), porque sozinha ela já é o sinal mais forte que o corredor pode
 * reportar.
 */
export function calcularBandaCargaForma(params: {
  cargaVida: CargaVida | null;
  rpeMedio: number | null;
  zonasAmarelaOuVermelha: number;
}): BandaCargaForma {
  const { cargaVida, rpeMedio, zonasAmarelaOuVermelha } = params;

  let sinais = 0;
  if (cargaVida === "carregada") sinais += 1;
  if (cargaVida === "muito_carregada") sinais += 2;
  if (zonasAmarelaOuVermelha >= 2) sinais += 1;
  if (rpeMedio !== null && rpeMedio >= 8) sinais += 1;

  if (sinais === 0) return "tranquila";
  if (sinais <= 2) return "atencao";
  return "sobrecarga";
}

export function zonaPredominante(zonas: ZonaResposta[]): ZonaResposta | null {
  if (zonas.length === 0) return null;
  const contagem: Record<ZonaResposta, number> = { verde: 0, amarela: 0, vermelha: 0 };
  for (const z of zonas) contagem[z] += 1;
  // Empate resolve pela mais grave — o painel nunca "arredonda pra baixo"
  // um sinal de atenção real.
  if (contagem.vermelha > 0 && contagem.vermelha >= contagem.amarela) return "vermelha";
  if (contagem.amarela > 0) return "amarela";
  return "verde";
}

export function montarCargaForma(params: {
  respostasRecentes: Resposta24h[];
  cargaVidaFallbackDiagnostico: CargaVida | null;
}): CargaFormaResumo | null {
  const { respostasRecentes, cargaVidaFallbackDiagnostico } = params;

  if (respostasRecentes.length === 0 && !cargaVidaFallbackDiagnostico) return null;

  const maisRecente = respostasRecentes[0] ?? null;
  const cargaVida = maisRecente?.carga_vida_percebida ?? cargaVidaFallbackDiagnostico;
  const cargaVidaOrigem: CargaFormaResumo["cargaVidaOrigem"] = maisRecente?.carga_vida_percebida
    ? "resposta24h"
    : cargaVidaFallbackDiagnostico
      ? "diagnostico"
      : null;

  const rpes = respostasRecentes.map((r) => r.esforco_percebido);
  const rpeMedio = rpes.length > 0 ? rpes.reduce((soma, v) => soma + v, 0) / rpes.length : null;

  const zonas = respostasRecentes.map((r) => r.zona);
  const zonasCriticas = zonas.filter((z) => z === "amarela" || z === "vermelha").length;

  return {
    banda: calcularBandaCargaForma({ cargaVida, rpeMedio, zonasAmarelaOuVermelha: zonasCriticas }),
    cargaVida,
    cargaVidaOrigem,
    rpeMedio,
    zonaPredominante: zonaPredominante(zonas),
  };
}

/**
 * RF06 — recalcula o score de risco do diagnóstico somando frequência de
 * zona amarela/vermelha e aderência do período, com a mesma lógica de
 * threshold do Fluxo 2 (55/25, calcularBanda). "Os dois sinais novos
 * somados" ao score inicial — regra §5 do PRD de painel.
 */
export function calcularRiscoAtualizado(params: {
  scoreInicial: number;
  bandaInicial: BandaRisco;
  zonasAmarelas: number;
  zonasVermelhas: number;
  aderenciaPercentual: number | null;
  temDadoNovo: boolean;
}): RiscoResumo {
  const { scoreInicial, bandaInicial, zonasAmarelas, zonasVermelhas, aderenciaPercentual, temDadoNovo } = params;

  if (!temDadoNovo) {
    return { bandaInicial, bandaAtual: bandaInicial, scoreAtual: scoreInicial, temDadoNovo: false };
  }

  let ajuste = zonasVermelhas * 10 + zonasAmarelas * 4;
  if (aderenciaPercentual !== null) {
    if (aderenciaPercentual >= 80) ajuste -= 10;
    else if (aderenciaPercentual < 40) ajuste += 8;
  }

  const scoreAtual = Math.max(0, Math.min(100, scoreInicial + ajuste));
  return { bandaInicial, bandaAtual: calcularBanda(scoreAtual), scoreAtual, temDadoNovo: true };
}

// ---------------------------------------------------------------------------
// Hierarquia visual dos cards (auditoria de design, 2026-09)
// ---------------------------------------------------------------------------
//
// Os 4 cards do painel nasceram numa grade estática — mesma ordem sempre,
// mesmo peso visual sempre, dado real ou não. Isso é o retrato de um
// dashboard genérico: uma lista de métricas, não uma leitura do que importa
// hoje. Um card de risco/carga em estado de atenção deveria vir logo depois
// do hero — é uma continuação do mesmo sinal, não mais uma métrica no meio
// da grade. Aderência nunca entra nessa corrida: a regra §6.1 do PRD já
// proíbe aderência de virar cobrança, e "promover" o card quando a
// aderência está baixa faria exatamente isso — puniria visualmente quem
// completou menos. Bem-estar também não compete: é um snapshot estático do
// diagnóstico, nunca "piora" de uma visita pra outra nesta versão.

/** 0 = tranquilo, 1 = atenção, 2 = alerta — mesma escala pra risco e carga/forma. */
function severidadeCargaForma(resultado: ResultadoPainel<CargaFormaResumo | null>): number {
  if (!resultado.ok || !resultado.data) return 0;
  return { tranquila: 0, atencao: 1, sobrecarga: 2 }[resultado.data.banda];
}

function severidadeRisco(resultado: ResultadoPainel<RiscoResumo>): number {
  if (!resultado.ok || !resultado.data.temDadoNovo) return 0;
  return { baixo: 0, moderado: 1, alto: 2 }[resultado.data.bandaAtual];
}

/**
 * Decide se o card de risco deve vir antes do card de carga/forma na grade.
 * Critério: o sinal mais grave sobe; em empate, mantém a ordem-padrão do
 * PRD (carga/forma antes de risco, RF05 antes de RF06).
 */
export function riscoPrimeiroQueCargaForma(
  risco: ResultadoPainel<RiscoResumo>,
  cargaForma: ResultadoPainel<CargaFormaResumo | null>,
): boolean {
  return severidadeRisco(risco) > severidadeCargaForma(cargaForma);
}

/**
 * Se risco OU carga/forma tem algum sinal de atenção, esse par sobe pra
 * logo depois do hero — continuação do mesmo alerta, não mais uma métrica
 * perdida no meio da grade. Sem sinal nenhum, a grade volta à ordem-padrão
 * do PRD (aderência primeiro).
 */
export function algumSinalDeAtencao(
  risco: ResultadoPainel<RiscoResumo>,
  cargaForma: ResultadoPainel<CargaFormaResumo | null>,
): boolean {
  return severidadeRisco(risco) > 0 || severidadeCargaForma(cargaForma) > 0;
}
