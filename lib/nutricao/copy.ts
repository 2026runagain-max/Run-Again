// Copy do pilar de Nutrição Esportiva — questionário (M02), onboarding (§7),
// estados (§8) e conteúdo educativo geral (N2/N4, RF13).
//
// Nota de origem (mesma ressalva já registrada em lib/avaliacao/copy.ts e
// lib/fisioterapia/copy.ts para a mesma classe de lacuna): o texto exato dos
// blocos do questionário nutricional viria de
// claude/motor-nutricao-esportiva-especificacao.md, que não está neste
// repositório. As perguntas abaixo foram construídas a partir do que o PRD
// já fixa (M02 é "mais completo que o resto do produto", blocos
// condicionais, dois momentos de tela de contexto — §7) e do que
// lib/nutricao/motor.ts precisa como entrada. Revisar com a nutricionista
// responsável antes de sair do beta.

// ---------------------------------------------------------------------------
// Onboarding (§7)
// ---------------------------------------------------------------------------

export const onboardingIntro = {
  eyebrow: "SUA ALIMENTAÇÃO, SINCRONIZADA COM SEU TREINO",
  titulo: "Isso não é uma dieta genérica.",
  corpo:
    "É a régua de uma nutricionista de verdade, aplicada ao que você está treinando essa semana. Você vai responder um questionário mais completo do que o resto do produto — é isso que permite a gente te dar uma orientação calculada, na hora, em vez de te colocar numa fila de espera. As regras por trás de cada número são de uma nutricionista da Equipe Run Again — e ela entra pessoalmente se alguma resposta pedir avaliação mais de perto, ou se algo não estiver funcionando pra você depois.",
  cta: "Começar minha avaliação nutricional",
};

export const onboardingSensivel = {
  eyebrow: "AS PRÓXIMAS PERGUNTAS",
  titulo: "Essa parte é mais pessoal —",
  tituloDestaque: "e é exatamente o que evita que sua orientação seja genérica.",
  corpo:
    "Perguntas sobre como você se relaciona com comida e, se for o seu caso, sobre seu ciclo, existem porque protegem você — é o que garante que nenhuma meta de peso ou restrição seja sugerida sem cuidado. Responda o que fizer sentido; pular também é uma resposta válida.",
  cta: "Continuar",
};

// ---------------------------------------------------------------------------
// Blocos do questionário (M02)
// ---------------------------------------------------------------------------

export const blocoBiometriaCopy = {
  eyebrow: "SEU PONTO DE PARTIDA",
  titulo: "Primeiro, alguns números.",
  corpo: "Isso é a base de qualquer cálculo de energia e macronutrientes — sem eles, não tem como calcular nada real.",
  pesoKg: { label: "Peso (kg)", placeholder: "Ex.: 68" },
  alturaCm: { label: "Altura (cm)", placeholder: "Ex.: 170" },
  idade: { label: "Idade", placeholder: "Ex.: 34" },
  sexoBiologico: {
    label: "Sexo biológico",
    opcoes: [
      { valor: "feminino", label: "Feminino" },
      { valor: "masculino", label: "Masculino" },
      { valor: "prefiro_nao_informar", label: "Prefiro não informar" },
    ],
  },
};

export const blocoObjetivoCopy = {
  eyebrow: "SEU OBJETIVO COM A ALIMENTAÇÃO",
  titulo: "O que você busca agora?",
  corpo: "Isso muda a estratégia — nunca o esforço que a gente coloca em calcular certo pra você.",
  objetivoNutricional: {
    label: "Objetivo principal",
    opcoes: [
      { valor: "performance", label: "Melhorar performance", descricao: "Correr melhor, com mais energia disponível." },
      { valor: "saude_geral", label: "Saúde geral e bem-estar", descricao: "Comer melhor no dia a dia, sem foco em número na balança." },
      { valor: "emagrecimento", label: "Emagrecimento", descricao: "Esse objetivo sempre passa por uma conversa com a equipe antes de qualquer número." },
      { valor: "ganho_massa", label: "Ganho de massa muscular", descricao: "Comer mais, de forma estratégica." },
    ],
  },
};

export const blocoAlimentarCopy = {
  eyebrow: "SEU PADRÃO ALIMENTAR",
  titulo: "Como você come hoje?",
  corpo: "Sem julgamento — é só o ponto de partida real, não o ideal.",
  padraoAlimentar: {
    label: "Padrão alimentar",
    opcoes: [
      { valor: "onivoro", label: "Onívoro", descricao: "Como de tudo." },
      { valor: "vegetariano", label: "Vegetariano" },
      { valor: "vegano", label: "Vegano" },
      { valor: "restricao_medica", label: "Tenho uma restrição médica", descricao: "Esse caso sempre passa pela equipe." },
    ],
  },
  alergiasIntolerancias: { label: "Alergias ou intolerâncias (opcional)", placeholder: "Ex.: lactose, amendoim..." },
  refeicoesPorDia: { label: "Quantas refeições você faz por dia, em média?", placeholder: "Ex.: 4" },
};

export const blocoDigestivoCopy = {
  eyebrow: "SEU ESTÔMAGO DURANTE A CORRIDA",
  titulo: "Como seu corpo reage durante o treino?",
  corpo: "Isso ajuda a calibrar o que sugerir antes e durante o treino.",
  desconfortoGiCorrida: {
    label: "Desconforto digestivo durante a corrida",
    opcoes: [
      { valor: "nunca", label: "Nunca" },
      { valor: "as_vezes", label: "Às vezes" },
      { valor: "frequente", label: "Frequentemente" },
    ],
  },
};

export const blocoSuplementosCopy = {
  eyebrow: "SUPLEMENTAÇÃO ATUAL",
  titulo: "Você usa algum suplemento hoje?",
  corpo: "Isso não muda se você precisa ou não de algo novo — só dá contexto.",
  usaSuplementos: {
    label: "Usa suplemento hoje?",
    opcoes: [
      { valor: "sim", label: "Sim" },
      { valor: "nao", label: "Não" },
    ],
  },
  quaisSuplementos: { label: "Quais? (opcional)", placeholder: "Ex.: whey, creatina..." },
};

export const blocoComportamentoCopy = {
  eyebrow: "SUA RELAÇÃO COM A COMIDA",
  titulo: "Algumas perguntas mais pessoais.",
  corpo: "Isso é o que garante que nenhuma meta de peso ou restrição seja sugerida sem cuidado — responda o que fizer sentido.",
  preocupacaoComPeso: {
    label: "De 0 a 10, o quanto pensar em peso ou corpo ocupa espaço na sua cabeça hoje?",
    hint: "0 = quase nada, 10 = ocupa bastante espaço",
  },
  historicoRestricaoAlimentar: {
    label: "Você já passou por um período de restrição alimentar significativa?",
    opcoes: [
      { valor: "sim", label: "Sim" },
      { valor: "nao", label: "Não" },
    ],
  },
  comportamentoCompensatorio: {
    label: "Você já se pegou 'compensando' o que comeu com mais treino ou menos comida depois?",
    opcoes: [
      { valor: "sim", label: "Sim" },
      { valor: "nao", label: "Não" },
    ],
  },
};

export const blocoSaudeMenstrualCopy = {
  eyebrow: "SUA SAÚDE MENSTRUAL",
  titulo: "Como está seu ciclo?",
  corpo: "O ciclo é um sinal real de disponibilidade de energia no corpo — por isso ele entra na conta.",
  regularidadeCiclo: {
    label: "Como está seu ciclo menstrual atualmente?",
    opcoes: [
      { valor: "regular", label: "Regular" },
      { valor: "irregular", label: "Irregular" },
      { valor: "ausente_amenorreia", label: "Ausente há 3 meses ou mais" },
      { valor: "uso_continuo_sem_ciclo", label: "Uso contínuo de método que suprime o ciclo" },
    ],
  },
  usaContraceptivoHormonal: {
    label: "Você usa algum contraceptivo hormonal?",
    opcoes: [
      { valor: "sim", label: "Sim" },
      { valor: "nao", label: "Não" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Estados (§8) — na voz da marca, --fire para erro, sem vermelho/verde
// ---------------------------------------------------------------------------

export const estados = {
  vazioHub: {
    titulo: "Sua orientação nutricional ainda não existe.",
    subtitulo: "O questionário leva um pouco mais de tempo que o resto — é o que permite a gente calcular algo real pra você, na hora.",
    cta: "Começar minha avaliação nutricional",
  },
  vazioHubEmAndamento: {
    titulo: "Sua avaliação está a caminho.",
    subtitulo: "Você já começou — continua de onde parou pra ver sua orientação calculada.",
    cta: "Continuar minha avaliação",
  },
  loadingSalvando: "Salvando sua resposta.",
  loadingCalculando: "Calculando sua orientação a partir das suas respostas — isso leva só um instante.",
  erroSalvarBloco: {
    subtitulo: "Não conseguimos salvar essa parte agora. O que você respondeu continua na tela — não foi perdido. Tenta de novo em instantes.",
    cta: "Tentar de novo",
  },
  erroCalcular: {
    titulo: "Quase lá.",
    subtitulo: "Sua avaliação está toda salva, mas não conseguimos montar sua orientação agora. Tenta de novo — se persistir, a gente já foi avisado.",
    cta: "Tentar novamente",
  },
  sucessoCalculada: (nomeNutricionista: string) =>
    `Sua orientação está pronta. Calculada a partir das regras clínicas de ${nomeNutricionista}, para o seu volume de treino desta semana.`,
  estadoN4: {
    titulo: "Sua avaliação está com a nossa equipe.",
    subtitulo:
      "Pra te dar uma orientação segura, algumas das suas respostas pedem um olhar mais de perto da nossa equipe antes de qualquer número. Isso não é motivo de alarme — é a mesma régua de cuidado que vale pra todo mundo aqui. Enquanto isso, aqui vai uma orientação geral pra você começar.",
  },
  sucessoAtualizadaVolume: "Seu volume de treino mudou — sua orientação foi atualizada com base nisso, dentro do mesmo cuidado de sempre.",
  sucessoAjustadaEquipe: (nomeNutricionista: string) => `${nomeNutricionista} revisou sua orientação e fez ajustes com base no que você reportou.`,
  vazioRegistro: "Nada registrado ainda. Registre o que fizer sentido pra você acompanhar — sua orientação não depende disso pra funcionar.",
};

export const estadosProfissional = {
  vazioSeguranca: "Nenhum caso pedindo avaliação de segurança agora.",
  vazioRevisao: "Nenhum plano sinalizado para revisão no momento.",
  loadingCaso: "Carregando o histórico deste corredor.",
  erroSalvarAjuste: "Não foi possível salvar agora. O que você digitou continua no formulário — nada foi perdido. Tenta salvar de novo.",
  sucessoAjusteSalvo: "Ajuste salvo. O corredor já vê a orientação atualizada.",
};

// ---------------------------------------------------------------------------
// RF13 — Conteúdo educativo geral (N2/N4), sem número individualizado
// ---------------------------------------------------------------------------

export const CONTEUDO_EDUCATIVO_GERAL: { titulo: string; texto: string }[] = [
  {
    titulo: "Coma perto do que você já treina",
    texto: "Nos dias de treino mais longo, aumente um pouco o carboidrato (arroz, batata, pão, frutas). Nos dias de descanso, uma refeição mais equilibrada em proteína e vegetais já cobre bem.",
  },
  {
    titulo: "Hidratação vale o dia inteiro, não só durante o treino",
    texto: "Beber água ao longo do dia importa mais do que tentar compensar tudo nas duas horas antes de correr.",
  },
  {
    titulo: "Proteína em toda refeição principal",
    texto: "Distribuir a proteína ao longo do dia (não só numa refeição) ajuda a recuperação muscular a acontecer de forma mais constante.",
  },
  {
    titulo: "Teste o que vai comer antes de uma prova, nunca no dia",
    texto: "O estômago responde melhor ao que já é familiar — use os treinos longos pra descobrir o que funciona pra você.",
  },
];

export const copyProntuarioNutricao = {
  semAvaliacao: "Este corredor ainda não começou a avaliação nutricional.",
  semOrientacao: "Avaliação concluída, mas ainda sem orientação — a triagem está sendo processada.",
};
