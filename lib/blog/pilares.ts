/**
 * Pilares de conteúdo do blog — categorização de `/blog/[pilar]`, §5 do PRD
 * "Site Aberto". Diferente dos 6 pilares do produto (lib/site/pilares-produto.ts):
 * aqui Medicina do Esporte e Psicologia do Esporte formam uma única
 * categoria editorial, e existe um pilar de cultura de marca que não é um
 * pilar de produto.
 */
export interface PilarBlog {
  slug: string;
  nome: string;
  descricao: string;
}

export const pilaresBlog: PilarBlog[] = [
  {
    slug: "fisioterapia-e-retorno-ao-esporte",
    nome: "Fisioterapia e Retorno ao Esporte",
    descricao: "Lesão, retorno gradual, sinais de alerta e os mitos do 'descanso total'.",
  },
  {
    slug: "preparo-fisico-e-carga-de-treino",
    nome: "Preparo Físico e Carga de Treino",
    descricao: "Progressão, carga de vida e periodização pra quem corre e também trabalha.",
  },
  {
    slug: "nutricao-esportiva",
    nome: "Nutrição Esportiva",
    descricao: "Orientação alimentar para o corredor amador e os mitos de dieta mais comuns.",
  },
  {
    slug: "medicina-e-psicologia-do-esporte",
    nome: "Medicina e Psicologia do Esporte",
    descricao: "Ansiedade de retorno, culpa por levar o hobby a sério e check-ins mentais.",
  },
  {
    slug: "cultura-returnista",
    nome: "Cultura Returnista",
    descricao: "Identidade de marca, histórias reais e a ideia de que hobby não tem teto.",
  },
];

export function getPilarBlog(slug: string): PilarBlog | undefined {
  return pilaresBlog.find((pilar) => pilar.slug === slug);
}
