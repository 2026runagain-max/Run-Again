import { capacidadeLabelCorredor } from "./labels";
import type { AssimetriaTeste, EvolucaoTeste } from "./types";

export interface Insight {
  titulo: string;
  texto: string;
}

/**
 * RF-J — frase de insight templada (sem IA neste beta).
 *
 * Regra de negócio (§6 do PRD de produto): nunca inventa frase sem dado real.
 * Só é chamada depois que a página já filtrou por total_medicoes >= 2 em pelo
 * menos um domínio (evolucao_pct != null) — ver getEvolucaoParaInsight.
 *
 * Seleção determinística (RF-J1): maior |evolução %| entre os domínios
 * comparáveis. Nunca mais de uma frase por visita (CA1) — a função sempre
 * retorna um único resultado.
 */
export function gerarInsight(
  evolucoes: EvolucaoTeste[],
  assimetrias: AssimetriaTeste[],
): Insight | null {
  const comparaveis = evolucoes.filter(
    (e) => e.total_medicoes >= 2 && e.evolucao_pct !== null,
  );
  if (comparaveis.length === 0) return null;

  const principal = comparaveis.reduce((maior, atual) =>
    Math.abs(atual.evolucao_pct!) > Math.abs(maior.evolucao_pct!) ? atual : maior,
  );

  const capacidade = capacidadeLabelCorredor[principal.capacidade];
  const pct = principal.evolucao_pct!;
  const nome = principal.nome.toLowerCase();

  const assimetria = assimetrias.find(
    (a) =>
      a.capacidade === principal.capacidade &&
      a.nome === principal.nome &&
      a.unidade === principal.unidade,
  );

  // Template 1 — evolução positiva relevante + assimetria com histórico comparável.
  // É o momento de maior prova ("conquista") do produto — a microcopy nomeia
  // a dúvida específica que a persona Returnista carrega (não em abstrato).
  if (pct >= 5 && assimetria && assimetria.assimetria_pct_inicial !== null) {
    return {
      titulo: "O que já mudou no seu corpo",
      texto:
        `Sua ${nome} subiu ${pct}% desde a avaliação inicial, e a assimetria entre ` +
        `as pernas caiu de ${assimetria.assimetria_pct_inicial}% para ${assimetria.assimetria_pct}%. ` +
        `Isso não é sorte, e não é você exagerando de novo — é protocolo, registrado em número.`,
    };
  }

  // Template 2 — evolução positiva forte (≥10%), sem par de assimetria comparável.
  if (pct >= 10) {
    return {
      titulo: "O que já mudou no seu corpo",
      texto:
        `Sua ${nome} subiu ${pct}% desde a avaliação inicial. Se uma parte de você ainda ` +
        `pergunta "será que eu tô querendo demais de novo?" — isso aqui é a resposta. ` +
        `Você está pegando certo, não pegando leve.`,
    };
  }

  // Template 3 — evolução positiva, mas ainda pequena.
  if (pct > 0) {
    return {
      titulo: "Um sinal, ainda cedo",
      texto:
        `Sua ${nome} já mostra ${pct}% de evolução desde a avaliação inicial. ` +
        `É cedo pra tirar conclusão grande, mas a curva já é sua — e ela é real, não motivação genérica.`,
    };
  }

  // Template 4 — estabilidade (sem variação relevante).
  if (pct === 0) {
    return {
      titulo: "Sua evolução",
      texto:
        `Sua ${nome} se manteve estável desde a avaliação inicial. Estabilidade também ` +
        `é dado — é o que o protocolo usa pra decidir o próximo passo.`,
    };
  }

  // Template 5 — queda: não-alarmista, sem framing de culpa (persona Returnista
  // já carrega isso — a marca existe para inverter essa culpa, não reforçar).
  if (pct < 0 && pct >= -15) {
    return {
      titulo: `${capacidade}: dado real, não veredito`,
      texto:
        `Sua ${nome} está ${Math.abs(pct)}% abaixo do que foi medido na avaliação inicial. ` +
        `É informação, não retrocesso definitivo — é isso que ajusta o seu protocolo agora.`,
    };
  }

  // Template 6 — fallback genérico (queda maior, ou qualquer caso não coberto acima).
  return {
    titulo: "Sua evolução",
    texto:
      `Sua ${nome} mudou ${Math.abs(pct)}% desde a avaliação inicial. ` +
      `Quem está cuidando do seu retorno já está com esse número — é ele que orienta a próxima sessão.`,
  };
}
