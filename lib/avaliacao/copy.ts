// Copy do Fluxo 2 — Onboarding, Avaliação Multidimensional e Diagnóstico Inicial.
//
// onboardingIntro, consentimento e estados abaixo transcrevem o texto exato
// definido em §7/§8 do documento de arquitetura de produto
// (claude/arquitetura-de-produto-fluxo-2-onboarding-avaliacao-diagnostico.md).
//
// As perguntas dos Blocos A–H (blocos abaixo) e a copy de diagnóstico NÃO têm
// fonte no repositório: o documento de arquitetura referencia
// prds/fluxo-2-onboarding-avaliacao-diagnostico.md pelo texto exato, mas esse
// arquivo não está aqui. O conteúdo abaixo foi escrito nesta implementação a
// partir das pistas estruturais que o documento de arquitetura já fixa (nomes
// de bloco, ramificação de A1, variação de E2 por persona, carga de vida no
// bloco F, respostas-chave A/B/E/F no e-mail à equipe) — na voz de marca
// (direto, científico, humano, empoderador; nunca linguagem de "erro" sobre
// decisão passada, regra §6). Revisar com produto contra o texto exato de
// prds/fluxo-2-onboarding-avaliacao-diagnostico.md assim que esse documento
// existir no repositório — mesma nota já registrada em
// supabase/migrations/0004_avaliacao_inicial.sql.

export const onboardingIntro = {
  eyebrow: "ANTES DE COMEÇAR",
  titulo: "A gente vai te fazer perguntas de verdade.",
  corpo:
    'Porque respostas de verdade é o que constrói um protocolo de verdade. Não é uma ficha pra preencher e esquecer. Cada bloco que vem a seguir alimenta diretamente o que a Equipe Run Again vai usar na sua primeira conversa — e o que você vai ver, ao final, é um retrato real de onde você está hoje, não um resultado genérico.',
  cta: "Entendi, vamos lá",
};

export const consentimentoSaude = {
  eyebrow: "SEUS DADOS DE SAÚDE",
  titulo: "Isso envolve histórico de saúde",
  tituloDestaque: "e a gente trata esse dado com o cuidado que ele exige.",
  corpo:
    "As próximas perguntas cobrem lesões, sono, alimentação e outros pontos sobre sua saúde. Usamos isso só para construir seu diagnóstico inicial e informar o profissional que vai te acompanhar — nunca para nada além disso. Você pode ler os detalhes na nossa política de privacidade.",
  checkbox: "Li e autorizo o uso desses dados de saúde para meu diagnóstico e acompanhamento no Run Again.",
  cta: "Continuar",
  versao: "saude-1.0",
};

export const personaCopy = {
  eyebrow: "PONTO DE PARTIDA",
  titulo: "O que descreve melhor onde você está agora?",
  corpo: "Isso muda como a gente conversa com você daqui pra frente — não muda o que você merece de cuidado.",
  opcoes: [
    {
      valor: "returnista" as const,
      titulo: "Estou voltando de uma lesão",
      descricao: "Já treinava, parei por causa de dor ou lesão, e quero voltar sem repetir o mesmo erro.",
    },
    {
      valor: "iniciante_consciente" as const,
      titulo: "Estou começando do zero",
      descricao: "Pouca ou nenhuma experiência com corrida, e quero começar do jeito certo desta vez.",
    },
    {
      valor: "amador_ambicioso" as const,
      titulo: "Estou evoluindo minha distância ou tempo",
      descricao: "Já corro com regularidade e quero performar mais, sem quebrar o corpo no processo.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Blocos A–H
// ---------------------------------------------------------------------------

export const blocoACopy = {
  eyebrow: "BLOCO A · 1 DE 8",
  titulo: "Seu histórico de lesão",
  corpo: "Isso é dado, não julgamento — quanto mais real, melhor a gente entende seu ponto de partida.",
  houveLesao: {
    label: "Nos últimos 12 meses, você teve alguma lesão que te afastou da corrida?",
    opcoes: [
      { valor: "sim", label: "Sim" },
      { valor: "nao", label: "Não" },
    ],
  },
  regiaoLesao: {
    label: "Onde foi a lesão?",
    opcoes: [
      { valor: "joelho", label: "Joelho" },
      { valor: "tornozelo_pe", label: "Tornozelo ou pé" },
      { valor: "quadril_virilha", label: "Quadril ou virilha" },
      { valor: "posterior_coxa", label: "Posterior de coxa" },
      { valor: "lombar", label: "Lombar" },
      { valor: "canela_panturrilha", label: "Canela ou panturrilha" },
      { valor: "outra", label: "Outra região" },
    ],
  },
  descricaoLesao: {
    label: "Quer contar mais sobre o que aconteceu?",
    placeholder: "Opcional.",
  },
  tratamentoLesao: {
    label: "Como você tratou essa lesão?",
    opcoes: [
      { valor: "fisioterapia_profissional", label: "Com acompanhamento de fisioterapia" },
      { valor: "conta_propria", label: "Por conta própria" },
      { valor: "ainda_tratando", label: "Ainda estou tratando" },
      { valor: "nao_tratou", label: "Não cheguei a tratar" },
    ],
  },
  situacaoAtualLesao: {
    label: "Como está essa região hoje?",
    opcoes: [
      { valor: "totalmente_resolvida", label: "Totalmente resolvida" },
      { valor: "ainda_sinto_as_vezes", label: "Ainda sinto algo, de vez em quando" },
      { valor: "ainda_me_limita", label: "Ainda me limita no dia a dia" },
    ],
  },
  tempoParado: {
    label: "Quanto tempo você ficou sem correr por causa disso?",
    opcoes: [
      { valor: "menos_1_mes", label: "Menos de 1 mês" },
      { valor: "1_a_3_meses", label: "De 1 a 3 meses" },
      { valor: "3_a_6_meses", label: "De 3 a 6 meses" },
      { valor: "mais_6_meses", label: "Mais de 6 meses" },
    ],
  },
};

export const blocoBCopy = {
  eyebrow: "BLOCO B · 2 DE 8",
  titulo: "Seu objetivo agora",
  corpo: "Sem isso, a gente não sabe pra onde te ajudar a ir.",
  objetivoPrincipal: {
    label: "Qual é o seu objetivo principal agora?",
    opcoes: [
      { valor: "voltar_a_correr_sem_dor", label: "Voltar a correr sem dor" },
      { valor: "completar_prova", label: "Completar uma prova" },
      { valor: "melhorar_tempo", label: "Melhorar meu tempo" },
      { valor: "criar_habito", label: "Criar o hábito de correr" },
      { valor: "outro", label: "Outro" },
    ],
  },
  provaAlvo: {
    label: "Tem uma prova ou data alvo?",
    placeholder: "Opcional.",
  },
  prazoObjetivo: {
    label: "Em quanto tempo você quer chegar lá?",
    opcoes: [
      { valor: "sem_prazo", label: "Sem prazo definido" },
      { valor: "3_meses", label: "Em até 3 meses" },
      { valor: "6_meses", label: "Em até 6 meses" },
      { valor: "1_ano_mais", label: "Daqui a 1 ano ou mais" },
    ],
  },
};

export const blocoCCopy = {
  eyebrow: "BLOCO C · 3 DE 8",
  titulo: "Sua rotina de treino hoje",
  corpo: "Não existe ponto de partida errado — só o seu ponto de partida real.",
  frequenciaSemanal: {
    label: "Quantas vezes por semana você treina hoje (qualquer atividade, não só corrida)?",
    opcoes: [
      { valor: "nao_treino_agora", label: "Não estou treinando agora" },
      { valor: "1_2x", label: "1 a 2 vezes" },
      { valor: "3_4x", label: "3 a 4 vezes" },
      { valor: "5x_mais", label: "5 vezes ou mais" },
    ],
  },
  volumeAtualKm: {
    label: "Se corre, quantos km por semana, em média?",
    placeholder: "Opcional. Em km.",
  },
  experienciaCorrida: {
    label: "Há quanto tempo você corre (mesmo com pausas)?",
    opcoes: [
      { valor: "menos_1_ano", label: "Menos de 1 ano" },
      { valor: "1_a_3_anos", label: "De 1 a 3 anos" },
      { valor: "mais_3_anos", label: "Mais de 3 anos" },
    ],
  },
};

export const blocoDCopy = {
  eyebrow: "BLOCO D · 4 DE 8",
  titulo: "Sono e alimentação",
  corpo: "Corpo que não recupera bem fora do treino também não evolui bem dentro dele.",
  qualidadeSono: {
    label: "Como está seu sono, hoje?",
    opcoes: [
      { valor: "ruim", label: "Ruim" },
      { valor: "regular", label: "Regular" },
      { valor: "boa", label: "Boa" },
    ],
  },
  horasSono: {
    label: "Quantas horas você dorme, em média?",
    opcoes: [
      { valor: "menos_6h", label: "Menos de 6h" },
      { valor: "6_a_7h", label: "6 a 7h" },
      { valor: "7_a_9h", label: "7 a 9h" },
      { valor: "mais_9h", label: "Mais de 9h" },
    ],
  },
  alimentacaoPercebida: {
    label: "Como você descreveria sua alimentação hoje?",
    opcoes: [
      { valor: "desorganizada", label: "Desorganizada" },
      { valor: "razoavel", label: "Razoável" },
      { valor: "estruturada", label: "Estruturada" },
    ],
  },
};

// E2 (receioPrincipal) muda de pergunta por persona — RF02-CA3.
const E2_POR_PERSONA: Record<string, string> = {
  returnista: "O que mais te assusta em voltar a treinar forte?",
  iniciante_consciente: "O que mais te preocupa em começar?",
  amador_ambicioso: "O que mais te tira do sério quando o treino não sai como planejado?",
};
const E2_PADRAO = "O que mais pesa quando você pensa no seu treino?";

export function labelReceioPrincipal(persona: string | null): string {
  return (persona && E2_POR_PERSONA[persona]) || E2_PADRAO;
}

export const blocoECopy = {
  eyebrow: "BLOCO E · 5 DE 8",
  titulo: "Como você está, por dentro",
  corpo: "Isso não é frescura — é dado tão real quanto qualquer medida física.",
  medoLesionar: {
    label: "O quanto o medo de se lesionar de novo pesa quando você pensa em treinar?",
    hint: "(0 = nem passa pela cabeça, 10 = pesa o tempo todo)",
  },
  receioPrincipal: {
    opcoes: [
      { valor: "nova_lesao", label: "Ter uma lesão nova" },
      { valor: "nao_evoluir_como_antes", label: "Não voltar a ser como antes" },
      { valor: "nao_atingir_meta", label: "Não atingir minha meta" },
      { valor: "frustracao_com_processo", label: "Me frustrar com o processo" },
      { valor: "nada_disso_me_preocupa", label: "Nada disso me preocupa" },
    ],
  },
  motivacaoPrincipal: {
    label: "O que mais te motiva a treinar?",
    opcoes: [
      { valor: "saude_bem_estar", label: "Saúde e bem-estar" },
      { valor: "superacao_pessoal", label: "Superação pessoal" },
      { valor: "performance_competitiva", label: "Performance competitiva" },
      { valor: "disciplina_rotina", label: "Disciplina e rotina" },
      { valor: "comunidade_pertencimento", label: "Comunidade e pertencimento" },
    ],
  },
};

export const blocoFCopy = {
  eyebrow: "BLOCO F · 6 DE 8",
  titulo: "Sua rotina e sua carga de vida",
  corpo: "O que acontece fora do treino também entra na conta do que seu corpo aguenta.",
  desafioRotina: {
    label: "Qual é o maior desafio da sua rotina pra manter a constância?",
    opcoes: [
      { valor: "falta_tempo", label: "Falta de tempo" },
      { valor: "cansaco_estresse", label: "Cansaço ou estresse" },
      { valor: "falta_lugar_seguro", label: "Falta de um lugar seguro pra treinar" },
      { valor: "falta_constancia", label: "Dificuldade de manter constância" },
      { valor: "nenhum_desafio_grande", label: "Nenhum desafio grande" },
    ],
  },
  nivelMovimentoDia: {
    label: "Como é seu nível de movimento no dia a dia, fora do treino?",
    opcoes: [
      { valor: "sentado_maior_parte", label: "Sentado a maior parte do tempo" },
      { valor: "alterno_sentado_em_pe", label: "Alterno entre sentado e em pé" },
      { valor: "ativo_o_dia_todo", label: "Ativo o dia todo" },
    ],
  },
  tempoDisponivelSemana: {
    label: "Quanto tempo por semana você consegue dedicar ao treino, de verdade?",
    opcoes: [
      { valor: "menos_2h", label: "Menos de 2h" },
      { valor: "2_a_4h", label: "2 a 4h" },
      { valor: "4_a_6h", label: "4 a 6h" },
      { valor: "mais_6h", label: "Mais de 6h" },
    ],
  },
};

export const blocoGCopy = {
  eyebrow: "BLOCO G · 7 DE 8",
  titulo: "Onde e como você treina",
  corpo: "Protocolo bom é o que cabe na sua vida real, não numa vida ideal.",
  localTreino: {
    label: "Onde você costuma treinar?",
    opcoes: [
      { valor: "rua_parque", label: "Rua ou parque" },
      { valor: "esteira", label: "Esteira" },
      { valor: "pista_atletismo", label: "Pista de atletismo" },
      { valor: "trilha", label: "Trilha" },
      { valor: "variado", label: "Varia bastante" },
    ],
  },
  acessoEquipamento: {
    label: "Que tipo de equipamento ou estrutura você tem acesso?",
    opcoes: [
      { valor: "nenhum", label: "Nenhum equipamento específico" },
      { valor: "tenis_adequado_apenas", label: "Só o tênis adequado" },
      { valor: "academia_completa", label: "Academia completa" },
    ],
  },
  observacaoAmbiente: {
    label: "Alguma coisa sobre onde ou como você treina que a gente deveria saber?",
    placeholder: "Opcional.",
  },
};

export const blocoHCopy = {
  eyebrow: "BLOCO H · 8 DE 8",
  titulo: "Pra fechar",
  corpo: "Última parte — isso ajuda a moldar como a gente te acompanha daqui pra frente.",
  prioridadeAgora: {
    label: "Se a gente só pudesse resolver uma coisa agora, qual seria?",
    opcoes: [
      { valor: "nao_lesionar_de_novo", label: "Não me lesionar de novo" },
      { valor: "evoluir_rapido", label: "Evoluir rápido" },
      { valor: "entender_meu_corpo", label: "Entender melhor meu corpo" },
      { valor: "ter_constancia", label: "Ter constância" },
    ],
  },
  expectativaAcompanhamento: {
    label: "Como você imagina o acompanhamento ideal?",
    opcoes: [
      { valor: "quero_muito_contato", label: "Quero bastante contato com a equipe" },
      { valor: "prefiro_autonomia_com_suporte", label: "Prefiro autonomia, com suporte quando eu precisar" },
      { valor: "ainda_nao_sei", label: "Ainda não sei" },
    ],
  },
  algoMais: {
    label: "Tem mais alguma coisa que a gente deveria saber antes da nossa conversa?",
    placeholder: "Opcional.",
  },
};

// ---------------------------------------------------------------------------
// Estados — §8 do documento de arquitetura, texto exato.
// ---------------------------------------------------------------------------

export const estados = {
  vazioPainelSemDiagnostico: {
    titulo: "Seu diagnóstico ainda não existe.",
    subtitulo: "Isso leva menos de 10 minutos — e é o que faz todo o resto do Run Again fazer sentido pra você.",
    cta: "Começar minha avaliação",
  },
  vazioPainelAvaliacaoIncompleta: {
    titulo: "Você já começou.",
    subtitulo: "Falta pouco pra ver seu diagnóstico completo.",
    cta: "Continuar minha avaliação",
  },
  loadingSalvandoBloco: "Salvando sua resposta.",
  loadingCalculandoDiagnostico: "Juntando tudo o que você contou.",
  erroSalvarBloco: {
    titulo: "Não conseguimos salvar essa parte agora.",
    subtitulo: "O que você respondeu continua na tela — não foi perdido. Tenta de novo em instantes.",
    cta: "Tentar de novo",
  },
  erroCalcularDiagnostico: {
    titulo: "Sua avaliação está toda salva, mas não conseguimos montar seu diagnóstico agora.",
    subtitulo: "Tenta de novo — se persistir, a gente já foi avisado.",
    cta: "Tentar novamente",
  },
  sucessoAvaliacaoConcluida: "Avaliação concluída. Aqui está o que ela mostra sobre você.",
  // Não usado enquanto RF06 (notificação por e-mail) estiver desligada no
  // beta — ver diagnosticoCopy.proximosPassosTexto. Mantido pro texto exato
  // do §8 não se perder quando a notificação reativar.
  sucessoCompartilhadoComEquipe:
    "Isso já está com quem vai te acompanhar. Seu diagnóstico também fica salvo aqui, sempre que você quiser rever.",
  vazioSubBlocoOpcional: "Sem problema não ter respondido tudo em detalhe — o que você deu já é suficiente pra gente começar.",
};

// ---------------------------------------------------------------------------
// Diagnóstico — rótulos que envolvem a tela de resultado (RF05).
// ---------------------------------------------------------------------------

export const diagnosticoCopy = {
  eyebrow: "SEU DIAGNÓSTICO INICIAL",
  avisoHipotese:
    "Isso é um ponto de partida pra conversa com quem vai te acompanhar — não é laudo, nem substitui avaliação clínica presencial.",
  bandaRiscoLabel: "Como seu corpo chega até aqui",
  perfilBiomecanicoLabel: "Hipótese biomecânica inicial",
  perfilBiomecanicoAviso: "Isso é autorrelato, não avaliação física — o profissional confirma isso na prática.",
  perfilPsicologicoLabel: "Como sua cabeça chega até aqui",
  pontosAtencaoLabel: "Pontos de atenção prioritários",
  proximosPassosLabel: "O que acontece agora",
  // RF06 (notificação automática à equipe) está desligada no beta por
  // decisão de produto — este texto não promete um envio que não acontece.
  // Quando RF06 reativar, trocar por estados.sucessoCompartilhadoComEquipe.
  proximosPassosTexto:
    "Seu diagnóstico está salvo e pronto pra sua próxima conversa com a Equipe Run Again — você pode voltar aqui quando quiser rever.",
  editarCta: "Algo mudou? Atualizar minha avaliação",
};

export const bandaRiscoLabel: Record<string, string> = {
  baixo: "Risco baixo",
  moderado: "Risco moderado",
  alto: "Risco alto",
};
