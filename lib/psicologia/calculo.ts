// Cálculos determinísticos do pilar de Psicologia do Esporte — cadência
// automática (RF-8) e a frase do badge de sinalização cruzada (RF-6). A
// zona em si (RF-2) é calculada no banco (calcular_zona_psicologica, ver
// 0007_psicologia_esportiva.sql) — nunca recalculada aqui: mesma regra de
// "nunca confiar em zona vinda do client" já usada em toda a Fisioterapia,
// só que aplicada também ao servidor Next.js, que não é a fonte de verdade
// dessa conta. Este arquivo só deriva TEXTO e DATAS a partir de uma zona já
// decidida pelo banco.

import "server-only";
import type { BandaRisco } from "@/lib/avaliacao/types";
import type { CadenciaPsicologica, CheckinPsicologia, ZonaResposta } from "./types";

// PLACEHOLDER desta implementação — pendente de revisão pelo psicólogo
// responsável (mesma nota da migração 0007). §5/§10.1-RF-8 do PRD: quinzenal
// por padrão, mensal após 3 check-ins verdes consecutivos com risco geral em
// banda baixa; qualquer amarela/vermelha reseta pra quinzenal.
export const CADENCIA_QUINZENAL_DIAS = 14;
export const CADENCIA_MENSAL_DIAS = 30;
export const VERDES_CONSECUTIVOS_PARA_MENSAL = 3;

/**
 * RF-8 — cadência automática. Nunca persistida (§3 da migração 0007): a
 * data do próximo check-in esperado é sempre recalculada a partir do
 * histórico real de zonas, mesma filosofia do card de continuidade da
 * Fisioterapia ("recalculado sob demanda, nunca persistido separadamente").
 */
export function calcularCadenciaPsicologica(params: {
  /** Ordenados do mais antigo para o mais recente. */
  checkinsAsc: Pick<CheckinPsicologia, "zona" | "criado_em">[];
  /** Data de conclusão do diagnóstico inicial (Fluxo 2) — origem da cadência
   * antes do primeiro check-in periódico existir (RF-8-CA1). */
  elegibilidadeDesde: string;
  bandaRiscoAtual: BandaRisco | null;
}): CadenciaPsicologica {
  const { checkinsAsc, elegibilidadeDesde, bandaRiscoAtual } = params;

  let verdesConsecutivos = 0;
  for (const c of checkinsAsc) {
    verdesConsecutivos = c.zona === "verde" ? verdesConsecutivos + 1 : 0;
  }

  const cadenciaDiasAtual =
    verdesConsecutivos >= VERDES_CONSECUTIVOS_PARA_MENSAL && bandaRiscoAtual === "baixo"
      ? CADENCIA_MENSAL_DIAS
      : CADENCIA_QUINZENAL_DIAS;

  const baseData = checkinsAsc.length > 0 ? checkinsAsc[checkinsAsc.length - 1].criado_em : elegibilidadeDesde;
  const proximoEsperadoEm = new Date(
    new Date(baseData).getTime() + cadenciaDiasAtual * 86_400_000,
  ).toISOString();

  return {
    cadenciaDiasAtual,
    proximoEsperadoEm,
    verdesConsecutivos,
    emAtraso: Date.now() > new Date(proximoEsperadoEm).getTime(),
  };
}

/**
 * RF-6-CA1 — frase de explicação do badge de sinalização cruzada, gerada em
 * TypeScript (texto pra humano ler — mesma convenção de todo o resto do
 * produto: copy centralizada em código, nunca hardcoded no banco). É a
 * mesma frase mostrada do lado psicologia — nunca uma "versão reduzida"
 * (regra explícita do RF-6). Retorna só o trecho variável: quem chama
 * prefixa "⚠ Sinal da Psicologia do Esporte ([data]) — " (§8 do PRD).
 */
export function fraseSinalCruzado(params: {
  zona: Exclude<ZonaResposta, "verde">;
  c1Atual: number;
  c1Anterior: number | null;
  quisConversar: boolean;
}): string {
  const { zona, c1Atual, c1Anterior, quisConversar } = params;

  if (quisConversar) {
    return "a Returnista pediu para conversar agora, antes do próximo check-in.";
  }

  if (c1Anterior !== null && c1Atual < c1Anterior) {
    return `confiança caiu de ${c1Anterior} para ${c1Atual} desde o check-in anterior.`;
  }

  return zona === "vermelha"
    ? "o check-in mais recente indicou um sinal de alerta na confiança ou no medo de se lesionar."
    : "o check-in mais recente indicou um sinal de atenção na confiança ou no medo de se lesionar.";
}

/**
 * RF-7 — frase do card de bem-estar mental do painel, a partir do check-in
 * periódico mais recente (substitui o retrato estático do diagnóstico
 * assim que existe pelo menos um check-in — RF-7-CA1/CA2).
 */
export function fraseBemEstarPorCheckin(checkin: Pick<CheckinPsicologia, "c1_confianca" | "zona">): string {
  const { c1_confianca, zona } = checkin;

  if (zona === "verde") {
    return `Sua confiança está em ${c1_confianca}/10 — dentro do esperado pra essa fase do seu retorno.`;
  }
  if (zona === "amarela") {
    return `Sua confiança está em ${c1_confianca}/10, um pouco mais baixa que no seu check-in anterior — isso já está sendo acompanhado de perto.`;
  }
  return `Sua confiança está em ${c1_confianca}/10 — um sinal que já está com quem cuida da sua cabeça no retorno.`;
}
