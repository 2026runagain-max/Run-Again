// RF01 — pré-preenchimento da avaliação do profissional a partir do
// diagnóstico do corredor (Fluxo 2). Mapeamento explícito taxonomia→
// taxonomia (mesmo padrão do RF-E do Fluxo 1 e de REGIAO_LABEL em
// lib/avaliacao/diagnostico.ts) — nunca correspondência de texto livre.
//
// RF01-CA2: isto só monta texto de sugestão pro formulário nascer
// preenchido — nada aqui grava no banco. RF01-CA1: o profissional edita
// livremente antes de salvar (o form já trata isso como defaultValue, não
// como valor controlado read-only).

import { blocoACopy, blocoBCopy, blocoFCopy } from "@/lib/avaliacao/copy";
import type { AvaliacaoInicialRow } from "@/lib/avaliacao/types";

function rotulo<T extends string>(opcoes: { valor: T; label: string }[], valor: T | undefined): string | null {
  if (!valor) return null;
  return opcoes.find((o) => o.valor === valor)?.label ?? null;
}

export interface PrefilAtendimento {
  queixaPrincipal: string;
  historicoSubjetivo: string;
}

/**
 * RF01.1 — só chamado quando o paciente já tem avaliacoes_iniciais concluída
 * (RF01-CA3: sem diagnóstico, o formulário nasce em branco como antes).
 */
export function gerarPrefilAtendimento(avaliacao: AvaliacaoInicialRow): PrefilAtendimento {
  const { blocoA, blocoB, blocoF } = avaliacao.respostas;

  // Condição / região de atenção.
  const partesQueixa: string[] = [];
  if (blocoA?.houveLesao === "sim") {
    const regiao = rotulo(blocoACopy.regiaoLesao.opcoes, blocoA.regiaoLesao);
    const situacao = rotulo(blocoACopy.situacaoAtualLesao.opcoes, blocoA.situacaoAtualLesao);
    if (regiao) {
      partesQueixa.push(
        `Autorrelato do diagnóstico: histórico de lesão em ${regiao.toLowerCase()}${situacao ? ` — situação atual relatada: "${situacao.toLowerCase()}"` : ""}.`,
      );
    }
    if (blocoA.descricaoLesao) {
      partesQueixa.push(`Descrição do corredor: "${blocoA.descricaoLesao}"`);
    }
  } else if (blocoA?.houveLesao === "nao") {
    partesQueixa.push("Autorrelato do diagnóstico: sem lesão relatada nos últimos 12 meses.");
  }

  // Objetivo de prescrição.
  const objetivo = rotulo(blocoBCopy.objetivoPrincipal.opcoes, blocoB?.objetivoPrincipal);
  const prazo = rotulo(blocoBCopy.prazoObjetivo.opcoes, blocoB?.prazoObjetivo);
  const partesHistorico: string[] = [];
  if (objetivo) {
    partesHistorico.push(`Objetivo declarado no diagnóstico: ${objetivo.toLowerCase()}${prazo ? `, prazo: ${prazo.toLowerCase()}` : ""}.`);
  }

  // Contexto de carga de vida / disponibilidade.
  const desafio = rotulo(blocoFCopy.desafioRotina.opcoes, blocoF?.desafioRotina);
  const disponibilidade = rotulo(blocoFCopy.tempoDisponivelSemana.opcoes, blocoF?.tempoDisponivelSemana);
  if (desafio || disponibilidade) {
    partesHistorico.push(
      `Contexto de rotina: ${[desafio && `maior desafio é ${desafio.toLowerCase()}`, disponibilidade && `disponibilidade semanal ${disponibilidade.toLowerCase()}`]
        .filter(Boolean)
        .join("; ")}.`,
    );
  }

  return {
    queixaPrincipal: partesQueixa.join(" "),
    historicoSubjetivo: partesHistorico.join(" "),
  };
}
