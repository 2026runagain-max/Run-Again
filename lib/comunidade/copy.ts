// Copy do fluxo de Comunidade — texto exato de §7 e §8 do PRD de
// arquitetura de produto. Centralizado aqui pra não divergir entre telas —
// mesma convenção de lib/psicologia/copy.ts e lib/painel/copy.ts. --fire só
// pra erro, ícone de check pra sucesso — nunca cor de semáforo, nunca
// número de reação em tipografia grande (regra §5/§6 do PRD).

export const onboardingComunidade = {
  eyebrow: "COMUNIDADE",
  titulo: "Aqui não é onde você mostra o quanto se esforçou.",
  tituloDestaque: "É onde você vê que não é a única.",
  // Texto exato do §7 do PRD, quebrado em 2 parágrafos no ponto onde o
  // próprio texto já muda de assunto (feed → conversa) — nenhuma palavra
  // reescrita, só a tipografia deixando as duas ideias visualmente
  // separadas em vez de um único bloco denso.
  corpoFeed:
    "Tudo que aparece no feed já é evidência real — a mesma que você vê no seu painel — que alguém do grupo decidiu compartilhar. Sem ranking, sem contagem de curtida em destaque, sem comparação.",
  corpoConversa:
    "E se o que você precisa hoje não é mostrar nada, mas conversar — o espaço abaixo é pra isso: uma dúvida, um desabafo, uma pergunta que só alguém que também está voltando entende de verdade.",
  cta: "Ver a Comunidade",
};

export const comunidadeCopy = {
  loading: "Carregando a Comunidade.",
  erroFeed: "Não conseguimos carregar essa parte da Comunidade agora. Não é nada que você fez — tenta de novo em instantes.",
  erroConversa: "Não conseguimos carregar essa parte da Comunidade agora. Não é nada que você fez — tenta de novo em instantes.",
  tentarDeNovo: "Tentar de novo",

  vazioFeed: "Ainda não há nada por aqui. Quando alguém do grupo tiver uma evidência para compartilhar, ela aparece nesta lista.",
  vazioConversa: "Ainda não há nenhuma conversa por aqui. Se você tem uma dúvida ou quer desabafar sobre a sua volta, pode ser a primeira pessoa a começar.",

  sucessoPublicarEvidencia: "✓ Compartilhado com o grupo.",
  sucessoPublicarTopicoOuResposta: "✓ Publicado.",
  sucessoExcluir: "✓ Removido. Só você via essa opção — ninguém mais vê o que você excluiu.",
  sucessoReportar: "Recebemos, vamos olhar com cuidado.",

  tituloFeed: "Feed de evidências",
  subtituloFeed: "Cada post aqui já passou pelo seu painel — nunca um relato solto de desempenho.",
  tituloConversa: "Espaço de conversa",
  subtituloConversa: "Uma dúvida, um medo, uma pergunta que só quem também está voltando entende.",

  // Mesma frase do link que abre o modal — o título não pode dizer algo
  // ligeiramente diferente do que a Returnista acabou de clicar (carga
  // cognitiva desnecessária: "isso é a mesma ação ou é outra coisa?").
  ctaCompartilhar: "Compartilhar isso com o grupo",
  modalCompartilharTitulo: "Compartilhar isso com o grupo",
  legendaLabel: "Quer adicionar uma legenda?",
  legendaHint: "Opcional — até 200 caracteres.",
  botaoCompartilhar: "Compartilhar",
  botaoCancelar: "Cancelar",

  novoTopicoTituloLabel: "Título",
  novoTopicoTituloPlaceholder: "Em poucas palavras, sobre o que é?",
  novoTopicoCorpoLabel: "O que você quer conversar?",
  novoTopicoCorpoPlaceholder: "Uma dúvida, um desabafo, uma pergunta — o que fizer sentido pra você agora.",
  botaoPublicarTopico: "Publicar",
  botaoResponder: "Responder",
  respostaPlaceholder: "Escreve sua resposta.",
  botaoMostrarRespostas: (n: number) => (n === 1 ? "1 resposta" : `${n} respostas`),
  botaoResponderAbrir: "Responder",

  botaoExcluir: "Excluir",
  confirmExcluirPostTitulo: "Excluir este post?",
  confirmExcluirPostCorpo: "Ele some do feed para todo mundo. Ninguém mais vai poder ver o que você compartilhou aqui.",
  confirmExcluirTopicoTitulo: "Excluir este tópico?",
  confirmExcluirTopicoCorpo: "Ele some da conversa para todo mundo, junto com as respostas que já recebeu.",
  confirmExcluirRespostaTitulo: "Excluir esta resposta?",
  confirmExcluirRespostaCorpo: "Ela some da conversa para todo mundo.",
  confirmExcluirLabel: "Excluir",

  botaoReportar: "Reportar",
  modalReportarTitulo: "Reportar este conteúdo",
  modalReportarCorpo: "Isso vai para revisão do time — sem mudar nada visível aqui até lá.",
  motivoLabel: "Quer contar o motivo?",
  motivoHint: "Opcional.",
  botaoReportarConfirmar: "Reportar",

  erroGenerico: "Não conseguimos registrar agora. O que você escreveu continua aqui — nada foi perdido. Tenta de novo.",
};

export const labelTipoEvidencia: Record<"risco" | "carga_forma" | "aderencia" | "insight", string> = {
  risco: "Risco",
  carga_forma: "Carga e forma",
  aderencia: "Aderência",
  insight: "Evolução",
};
