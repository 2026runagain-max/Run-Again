/**
 * Os 5 pilares do ecossistema Run Again — usados no Pillar Card da home
 * (seção "Os 5 pilares", copy/home-lista-fundadoras.md) e em /metodo, onde
 * o mesmo conjunto aparece explicado em profundidade (§6.6 do PRD "Site
 * Aberto"). Mesmo ícone/nome nos dois lugares, como pede a §5 do PRD.
 *
 * Medicina do Esporte foi removida da estratégia de produto: o Run Again
 * não terá médico do esporte, ortopedista, nem avaliação médica na equipe.
 * Decisão de produto — não reintroduzir este pilar sem revisar essa decisão.
 *
 * Texto de `descricaoLonga` é original desta tarefa (não existe em nenhum
 * documento fornecido) — escrito a partir do que o PRD e a copy de home já
 * afirmam sobre cada pilar, sem inventar dado clínico, número ou nome novo.
 */
export interface PilarProduto {
  slug: string;
  emoji: string;
  nome: string;
  descricaoCurta: string;
  descricaoLonga: string;
}

export const pilaresProduto: PilarProduto[] = [
  {
    slug: "fisioterapia",
    // Feedback da Marina (teste real, 2026-09): era 🩹 (band-aid) — comunica
    // exatamente o mito que a marca existe pra quebrar (fisioterapia = só
    // pra quem já se machucou). Trocado por um ícone de força/fortalecimento.
    emoji: "💪",
    // Terminologia (decisão de produto, 2026-09): Preparo Físico e
    // Fisioterapia são a mesma entrega pro corredor — só muda a palavra.
    // "Fisioterapia" continua existindo como termo técnico interno (campo
    // de especialidade do profissional, slug desta entrada, prontuário
    // clínico) — nunca mais no nome exibido ao corredor.
    nome: "Treino",
    descricaoCurta:
      "Retorno ao esporte com evidência científica — não repouso genérico até 'melhorar'.",
    descricaoLonga:
      "É o pilar que trata a causa, não só o sintoma. Cada protocolo é assinado com o mesmo rigor clínico usado com atletas patrocinados, adaptado pra quem também carrega uma rotina de trabalho fora do treino. O objetivo nunca é só tirar a dor — é entender por que ela apareceu e progredir sem repetir o mesmo erro.",
  },
  {
    slug: "preparacao-fisica",
    emoji: "📈",
    nome: "Preparação Física",
    descricaoCurta:
      "Progressão de carga real, calculada com a sua carga de vida — não só o pace.",
    descricaoLonga:
      "Progressão de treino de verdade considera o que acontece fora da pista: os passos do trabalho, o sono maldormido, o estresse do dia. É isso que o Run Again chama de 'carga de vida' — ela entra na conta do seu volume da semana, em vez de tratar cada corredor como se vivesse só para correr.",
  },
  {
    slug: "nutricao-esportiva",
    emoji: "🥗",
    nome: "Nutrição Esportiva",
    descricaoCurta: "Orientação alimentar para o corredor amador — sem mito de dieta.",
    descricaoLonga:
      "Orientação alimentar pensada pra rotina real de quem corre e trabalha — sem prometer fórmula mágica nem cortar grupo alimentar inteiro por modismo. O que muda é o que sustenta sua evolução, coordenado com o que os pilares de Treino e Preparação Física já sabem sobre o seu momento.",
  },
  {
    slug: "psicologia-do-esporte",
    emoji: "🧠",
    nome: "Psicologia do Esporte",
    descricaoCurta:
      "Ansiedade de retorno e culpa por levar o hobby a sério — tratadas como parte do trabalho.",
    descricaoLonga:
      "O medo de se machucar de novo e a culpa de 'estar exagerando' num hobby não são obstáculo pro protocolo — são parte dele. Este pilar existe pra dar nome e acompanhamento a isso, com check-ins que nenhum concorrente genérico de treino oferece.",
  },
  {
    slug: "comunidade",
    emoji: "🫂",
    nome: "Comunidade",
    descricaoCurta: "Um espaço de gente que também está voltando — não fórum genérico.",
    descricaoLonga:
      "Um espaço só de gente que entende o tamanho do medo de voltar, porque também está voltando. Não é um fórum genérico de corrida — é onde a tribo Returnista troca o que está funcionando, sem ninguém precisar provar que 'sofreu o suficiente' pra merecer estar ali.",
  },
];
