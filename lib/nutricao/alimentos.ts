// Item 15 (feedback da Marina) — "isso equivale a..." e cardápio básico.
//
// Deliberadamente fora de motor.ts (que carrega import "server-only"):
// este arquivo só faz aritmética simples em cima de um alvo de macros que
// JÁ foi calculado pelo motor pra aquela pessoa (nunca decide o alvo em si)
// — mesma divisão de responsabilidade de guia-treino.ts, e pelo mesmo
// motivo: precisa ser importável direto por um Client Component
// (components/nutricao/CardapioEEquivalencias.tsx) sem arriscar vazar
// M03–M08 pro bundle do client por associação.
//
// A tabela de alimentos abaixo é uma referência nutricional genérica e
// amplamente documentada (TACO/USDA, valores por 100g arredondados) — não
// vem de claude/motor-nutricao-esportiva-especificacao.md (que não existe
// neste repositório, mesma ressalva já registrada no topo de motor.ts).
// Cada alimento é escolhido por ser comum na mesa brasileira (regra do
// pedido: "alimentos comuns brasileiros"), nunca por preferência ou
// restrição — quem tem uma restrição já é roteado pra N4 antes de qualquer
// número existir (ver calcularTriagem em motor.ts).

import type { MacrosDia } from "./types";

export type MacroTipo = "carboidrato" | "proteina" | "gordura";

export interface AlimentoComum {
  nome: string;
  macroPrincipal: MacroTipo;
  // Composição por 100g (fonte: TACO/USDA, arredondado).
  carboidratoG100: number;
  proteinaG100: number;
  gorduraG100: number;
  // Medida caseira usada só pra tornar a quantidade mais concreta de ler —
  // o cálculo em si é sempre feito em gramas. Singular/plural escritos por
  // extenso de propósito (nunca "+ s" automático): em português o plural
  // muda o SUBSTANTIVO da medida, não só o adjetivo no fim ("colher de
  // sopa" → "colheres de sopa", não "colher de sopas") — regra de
  // linguagem da própria tarefa (item 5) vale aqui também.
  unidadeNome: string;
  unidadeNomePlural: string;
  unidadeGramas: number;
}

export const ALIMENTOS_COMUNS: AlimentoComum[] = [
  // --- fontes de carboidrato ---
  { nome: "Arroz branco cozido", macroPrincipal: "carboidrato", carboidratoG100: 28, proteinaG100: 2.5, gorduraG100: 0.2, unidadeNome: "colher de sopa cheia", unidadeNomePlural: "colheres de sopa cheias", unidadeGramas: 25 },
  { nome: "Batata-doce cozida", macroPrincipal: "carboidrato", carboidratoG100: 20, proteinaG100: 1.6, gorduraG100: 0.1, unidadeNome: "unidade pequena", unidadeNomePlural: "unidades pequenas", unidadeGramas: 100 },
  { nome: "Pão francês", macroPrincipal: "carboidrato", carboidratoG100: 58, proteinaG100: 8, gorduraG100: 1.5, unidadeNome: "unidade", unidadeNomePlural: "unidades", unidadeGramas: 50 },
  { nome: "Banana", macroPrincipal: "carboidrato", carboidratoG100: 23, proteinaG100: 1.1, gorduraG100: 0.3, unidadeNome: "unidade média", unidadeNomePlural: "unidades médias", unidadeGramas: 90 },
  { nome: "Aveia em flocos", macroPrincipal: "carboidrato", carboidratoG100: 61, proteinaG100: 14, gorduraG100: 7, unidadeNome: "colher de sopa", unidadeNomePlural: "colheres de sopa", unidadeGramas: 15 },
  { nome: "Feijão carioca cozido", macroPrincipal: "carboidrato", carboidratoG100: 14, proteinaG100: 5, gorduraG100: 0.5, unidadeNome: "concha média", unidadeNomePlural: "conchas médias", unidadeGramas: 80 },

  // --- fontes de proteína ---
  { nome: "Peito de frango grelhado", macroPrincipal: "proteina", carboidratoG100: 0, proteinaG100: 32, gorduraG100: 3.6, unidadeNome: "filé médio", unidadeNomePlural: "filés médios", unidadeGramas: 120 },
  { nome: "Ovo cozido", macroPrincipal: "proteina", carboidratoG100: 0.6, proteinaG100: 13, gorduraG100: 10, unidadeNome: "unidade", unidadeNomePlural: "unidades", unidadeGramas: 50 },
  { nome: "Iogurte natural integral", macroPrincipal: "proteina", carboidratoG100: 4.7, proteinaG100: 3.5, gorduraG100: 3, unidadeNome: "pote", unidadeNomePlural: "potes", unidadeGramas: 170 },
  { nome: "Queijo minas frescal", macroPrincipal: "proteina", carboidratoG100: 3, proteinaG100: 17, gorduraG100: 15, unidadeNome: "fatia", unidadeNomePlural: "fatias", unidadeGramas: 30 },

  // --- fontes de gordura ---
  { nome: "Azeite de oliva", macroPrincipal: "gordura", carboidratoG100: 0, proteinaG100: 0, gorduraG100: 100, unidadeNome: "colher de sopa", unidadeNomePlural: "colheres de sopa", unidadeGramas: 13 },
  { nome: "Castanha-do-pará", macroPrincipal: "gordura", carboidratoG100: 12, proteinaG100: 14, gorduraG100: 66, unidadeNome: "unidade", unidadeNomePlural: "unidades", unidadeGramas: 5 },
  { nome: "Abacate", macroPrincipal: "gordura", carboidratoG100: 8.5, proteinaG100: 2, gorduraG100: 14.7, unidadeNome: "¼ unidade média", unidadeNomePlural: "¼ unidades médias", unidadeGramas: 50 },
];

const CHAVE_MACRO_G100: Record<MacroTipo, keyof Pick<AlimentoComum, "carboidratoG100" | "proteinaG100" | "gorduraG100">> = {
  carboidrato: "carboidratoG100",
  proteina: "proteinaG100",
  gordura: "gorduraG100",
};

function arredondarMeio(valor: number): number {
  return Math.round(valor * 2) / 2;
}

function formatarQuantidade(alimento: AlimentoComum, gramas: number): string {
  const gramasArredondados = Math.round(gramas);
  const unidades = arredondarMeio(gramas / alimento.unidadeGramas);
  const rotuloUnidade = unidades === 1 ? alimento.unidadeNome : alimento.unidadeNomePlural;
  return `≈ ${unidades} ${rotuloUnidade} (${gramasArredondados} g)`;
}

export interface EquivalenciaAlimento {
  alimento: string;
  quantidade: string;
}

/**
 * "Isso equivale a..." (item 15a) — 2-3 alimentos comuns, cada um mostrado
 * SOZINHO já soma a mesma quantidade daquele macro (não é uma combinação
 * dos três juntos) — é uma lista de trocas, não uma refeição.
 */
export function listarEquivalencias(macro: MacroTipo, gramasAlvo: number): EquivalenciaAlimento[] {
  if (gramasAlvo <= 0) return [];

  const chave = CHAVE_MACRO_G100[macro];
  return ALIMENTOS_COMUNS.filter((a) => a.macroPrincipal === macro)
    .slice(0, 3)
    .map((alimento) => {
      const gramasNecessarios = (gramasAlvo * 100) / alimento[chave];
      return { alimento: alimento.nome, quantidade: formatarQuantidade(alimento, gramasNecessarios) };
    });
}

// ---------------------------------------------------------------------------
// Cardápio básico (item 15b)
// ---------------------------------------------------------------------------

export interface ItemCardapio {
  alimento: string;
  quantidade: string;
}

export interface RefeicaoCardapio {
  nome: string;
  // Alimento de carboidrato, de proteína e (quando o alvo de gordura da
  // refeição ainda não foi coberto pelos dois primeiros) um terceiro item
  // de gordura — nunca os 3 macros de uma refeição só com 1 alimento.
  itens: ItemCardapio[];
}

export interface CardapioBasico {
  refeicoes: RefeicaoCardapio[];
  nota: string;
}

// Proporção de cada macro do dia que cada refeição recebe — mesma
// distribuição pras 3 pessoas, mas a QUANTIDADE final vem sempre do alvo de
// macros já calculado daquela pessoa específica (MacrosDia), nunca de um
// valor genérico fixo (regra explícita do pedido).
const PROPORCAO_REFEICAO = {
  "Café da manhã": 0.25,
  Almoço: 0.35,
  "Lanche da tarde": 0.15,
  Jantar: 0.25,
} as const;

// Combinação fixa de alimentos por refeição — escolha realista pra mesa
// brasileira, não um sorteio; a variedade de fato personalizada está nas
// quantidades, calculadas abaixo pra bater com o alvo de cada pessoa.
const ALIMENTO_POR_NOME = new Map(ALIMENTOS_COMUNS.map((a) => [a.nome, a]));
function alimento(nome: string): AlimentoComum {
  const a = ALIMENTO_POR_NOME.get(nome);
  if (!a) throw new Error(`Alimento "${nome}" não encontrado na tabela.`);
  return a;
}

const COMPOSICAO_REFEICAO: Record<keyof typeof PROPORCAO_REFEICAO, { carbo: AlimentoComum; proteina: AlimentoComum; gordura: AlimentoComum }> = {
  "Café da manhã": { carbo: alimento("Aveia em flocos"), proteina: alimento("Ovo cozido"), gordura: alimento("Castanha-do-pará") },
  Almoço: { carbo: alimento("Arroz branco cozido"), proteina: alimento("Peito de frango grelhado"), gordura: alimento("Azeite de oliva") },
  "Lanche da tarde": { carbo: alimento("Banana"), proteina: alimento("Iogurte natural integral"), gordura: alimento("Castanha-do-pará") },
  Jantar: { carbo: alimento("Batata-doce cozida"), proteina: alimento("Peito de frango grelhado"), gordura: alimento("Azeite de oliva") },
};

/**
 * Calcula, pra cada refeição, a quantidade dos 3 alimentos fixos daquele
 * horário que bate com a fatia do alvo diário de macros DAQUELA pessoa
 * (macros já veio de calcularMacros() em motor.ts, calculado a partir do
 * peso/energia dela — nunca um cardápio igual pra todo mundo, mesmo a
 * composição dos alimentos sendo a mesma referência).
 *
 * Carboidrato e proteína usam o alimento dedicado de cada categoria;
 * gordura primeiro conta o que os itens de carbo/proteína já trazem
 * consigo (nenhum alimento real tem só um macro) e só completa a
 * diferença com o item de gordura — pra não superestimar a refeição.
 */
export function montarCardapioBasico(macrosAlvo: MacrosDia): CardapioBasico {
  const refeicoes: RefeicaoCardapio[] = (Object.keys(PROPORCAO_REFEICAO) as (keyof typeof PROPORCAO_REFEICAO)[]).map((nomeRefeicao) => {
    const proporcao = PROPORCAO_REFEICAO[nomeRefeicao];
    const { carbo, proteina, gordura } = COMPOSICAO_REFEICAO[nomeRefeicao];

    const carboAlvoG = macrosAlvo.carboidratoG * proporcao;
    const proteinaAlvoG = macrosAlvo.proteinaG * proporcao;
    const gorduraAlvoG = macrosAlvo.gorduraG * proporcao;

    const carboGramas = (carboAlvoG * 100) / carbo.carboidratoG100;
    const proteinaGramas = (proteinaAlvoG * 100) / proteina.proteinaG100;

    const gorduraJaCoberta = (carboGramas * carbo.gorduraG100) / 100 + (proteinaGramas * proteina.gorduraG100) / 100;
    const gorduraRestanteG = Math.max(0, gorduraAlvoG - gorduraJaCoberta);
    const gorduraGramas = (gorduraRestanteG * 100) / gordura.gorduraG100;

    const itens: ItemCardapio[] = [
      { alimento: carbo.nome, quantidade: formatarQuantidade(carbo, carboGramas) },
      { alimento: proteina.nome, quantidade: formatarQuantidade(proteina, proteinaGramas) },
    ];
    // Só mostra o item de gordura se ainda sobrar alguma coisa real pra
    // completar — meia colher de azeite não ajuda ninguém.
    if (gorduraGramas >= gordura.unidadeGramas * 0.4) {
      itens.push({ alimento: gordura.nome, quantidade: formatarQuantidade(gordura, gorduraGramas) });
    }

    return { nome: nomeRefeicao, itens };
  });

  return {
    refeicoes,
    nota: "Quantidades calculadas a partir do seu alvo de macros do dia — troque qualquer item pelo equivalente da lista acima, sem medo de sair do lugar.",
  };
}
