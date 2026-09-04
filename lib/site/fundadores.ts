/**
 * Texto de "Quem somos" — copy/home-lista-fundadoras.md, seção 3. Fonte
 * única pra não divergir entre a home e /sobre (§6.6 do PRD manda reusar
 * exatamente este texto em /sobre).
 */
export interface Fundador {
  inicial: string;
  nome: string;
  papel: string;
  texto: string;
}

export const fundadores: Fundador[] = [
  {
    inicial: "B",
    nome: "Bruna",
    papel: "Fundadora, Visão e Produto",
    texto:
      "Bruna era só mais uma corredora amadora até o dia em que uma dor no joelho virou meses parada. Fisioterapia que não conversava com o treino. Treino que não considerava as 8 horas de trabalho puxando o corpo antes mesmo de calçar o tênis. E a sensação — nunca dita em voz alta — de que talvez ela tivesse “exagerado” num hobby que deveria ser leve. A volta só aconteceu de verdade quando o cuidado parou de ser genérico. Foi aí que nasceu a pergunta que virou o Run Again: por que o corredor amador tem acesso a menos cuidado do que um atleta profissional, se o corpo dele carrega o mesmo risco — e ainda precisa aguentar o expediente inteiro depois do treino?",
  },
  {
    inicial: "G",
    nome: "Gustavo",
    papel: "Fundador, Direção Científica",
    texto:
      "Gustavo é fisioterapeuta há mais de 25 anos, maratonista e está se preparando para o Ironman. Assina cada protocolo do Run Again com o mesmo rigor que usa com os próprios atletas — porque, pra ele, amador não é sinônimo de “pode ser mais leve”. É sinônimo de alguém que precisa de mais critério, porque não tem o privilégio de descansar por obrigação como um profissional.",
  },
];

export const fechamentoQuemSomos =
  "Foi da soma dessas duas histórias — quem viveu o medo e quem sabe tratar o corpo com ciência — que nasceu o Run Again.";
