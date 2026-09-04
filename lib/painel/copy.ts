// Copy do painel de progresso (/corredor/painel) — texto exato de §7 e §8 do
// PRD "Arquitetura de Produto — Protocolo Integrado e Dashboard de
// Progresso". Mesma convenção de lib/fisioterapia/copy.ts: centralizado
// aqui pra não divergir entre telas, --fire só pra erro, check só pra
// sucesso — nunca cor de semáforo (regra já registrada em ZonaBadge).

export const onboardingPainel = {
  eyebrow: "SEU PAINEL",
  titulo: "Aqui não é onde você mede se está fazendo o suficiente.",
  tituloDestaque: "É onde você vê o que já é verdade sobre o seu corpo.",
  corpo:
    "Cada número aqui vem de algo que você já contou ou já fez — seu diagnóstico, suas sessões, suas respostas de como você se sentiu. Conforme você usa o protocolo, esta tela vai mostrando aderência, carga, risco e forma — sempre com o porquê ao lado, nunca só um número. E, aos poucos, os outros cuidados do Run Again — nutrição, medicina do esporte, psicologia — vão aparecer aqui também.",
  cta: "Ver minha sessão de hoje",
};

export const estadosPainel = {
  vazioHero:
    "Ainda não temos seu retorno de ontem. Assim que você responder como se sentiu na sessão, esta tela passa a se ajustar a você.",
  vazioAderencia: "Sem sessão prescrita ainda, não há o que somar aqui. Isso muda assim que seu protocolo começar.",
  vazioRisco:
    "Seu ponto de partida é o do seu diagnóstico. Depois da primeira sessão, esta tela começa a mostrar se e como ele está mudando.",
  vazioCargaForma:
    "Ainda não há resposta de 24h suficiente para calcular sua carga desta semana. Isso muda assim que você responder à próxima sessão.",
  vazioHistorico: "Ainda não há atendimento concluído. Assim que um for finalizado, ele aparece aqui.",
  loading: "Carregando seu painel.",
  erroGenerico: {
    titulo: "Não conseguimos carregar essa parte do seu painel agora.",
    subtitulo: "Não é nada que você fez — tenta de novo em instantes.",
    cta: "Tentar de novo",
  },
  sucessoExercicioConcluido: "✓ Registrado.",
};

// Rótulos das seções do painel — sempre em segunda pessoa possessiva
// ("sua"/"seu"), nunca rótulo clínico neutro: é você lendo sobre você, não
// uma ficha sobre um paciente genérico. Auditoria de design (2026-09):
// antes deste ajuste, 3 dos 4 cards usavam rótulo objetivo ("ADERÊNCIA
// DESTA SESSÃO") e só um usava posse ("SEU BEM-ESTAR") — inconsistência de
// voz que nenhum concorrente notaria, mas que o sistema de design exige.
export const eyebrowsPainel = {
  hero: "STATUS DE HOJE",
  aderencia: "SUA ADERÊNCIA",
  cargaForma: "SUA CARGA E FORMA",
  risco: "SEU RISCO ATUALIZADO",
  bemEstar: "SEU BEM-ESTAR",
  historico: "HISTÓRICO COM SEUS PROFISSIONAIS",
};

// RF03 — "ação" que acompanha a zona no hero. A adaptação é aviso/gate,
// nunca reescrita autônoma de conteúdo (regra §6, herdada de RF-E2-CA1 do
// Fluxo 1): a frase orienta, a próxima sessão prescrita continua dependendo
// de revisão do profissional.
//
// Auditoria de design (2026-09): a versão anterior de amarela/vermelha
// mandava a Returnista "falar com o profissional" sem nenhum canal no
// produto pra isso — uma promessa que o beta não cumpre (sem chat, sem
// contato direto no app). Corrigido pra afirmar o que já é verdade: a
// resposta de 24h já está visível no prontuário (app/profissional/
// pacientes/[id]/page.tsx já mostra "Últimas respostas de 24h") — ela não
// precisa correr atrás de ninguém, o protocolo já rodou. "Pegar certo, não
// pegar leve" (vocabulário próprio do Run Again, mesma frase de
// lib/avaliacao/diagnostico.ts) substitui o genérico "isso não é pra você
// decidir sozinha" — é o ângulo que só o Run Again ocupa, não devia ficar
// só no diagnóstico do dia 1.
export const acaoPorZona: Record<"verde" | "amarela" | "vermelha", { label: string; frase: string }> = {
  verde: {
    label: "Siga como planejado",
    frase: "Sua última resposta veio dentro do esperado — siga para a sessão de hoje sem ajuste.",
  },
  amarela: {
    label: "Atenção antes de avançar",
    frase:
      "Sua última resposta pediu atenção — e isso já está com quem cuida do seu retorno, ele vê antes da próxima sessão. Não é sobre pegar leve com você: é sobre pegar certo.",
  },
  vermelha: {
    label: "Isso já está com seu profissional",
    frase:
      "Sua última resposta indicou alerta. Já chegou pra quem cuida do seu retorno — não é uma decisão que sobra pra você tomar sozinha. Isso não é sobre pegar leve com você: é sobre pegar certo.",
  },
};

export const aderenciaFrasePorFaixa = (percentual: number): string => {
  if (percentual >= 100) {
    return "Você concluiu tudo que foi prescrito nesta sessão — é isso que dá pro seu profissional ver sua rotina real, não só o que você lembra de contar.";
  }
  if (percentual >= 60) {
    return "Boa parte do que foi prescrito já está concluído. O que falta continua disponível — sem pressa, sem cobrança.";
  }
  if (percentual > 0) {
    return "Você já começou. Cada exercício marcado é dado real chegando pra quem cuida do seu retorno — sem cobrança sobre o quanto falta.";
  }
  return "Ainda nenhum exercício marcado nesta sessão. Isso não é atraso — é só o retrato de agora.";
};

export const bandaCargaFormaLabel: Record<"tranquila" | "atencao" | "sobrecarga", string> = {
  tranquila: "Tranquila",
  atencao: "Atenção",
  sobrecarga: "Sobrecarga",
};

export const bandaCargaFormaFrase: Record<"tranquila" | "atencao" | "sobrecarga", string> = {
  tranquila:
    "Sua carga de vida, esforço percebido e as respostas recentes estão equilibrados — bom momento pra seguir progredindo no ritmo combinado.",
  atencao:
    "Existe algum sinal de sobrecarga somando carga de vida e as últimas respostas — não é motivo de pânico, mas vale observar de perto nos próximos dias.",
  sobrecarga:
    "Vários sinais estão altos ao mesmo tempo — carga de vida, esforço e/ou respostas recentes. Isso é informação pro seu profissional ajustar o ritmo, não um julgamento sobre você.",
};

export const riscoCopy = {
  labelInicial: "Ponto de partida (diagnóstico)",
  labelAtual: "Como está agora",
  comparacaoMelhorou: (inicial: string, atual: string) =>
    `Desde o diagnóstico (${inicial}), seu risco está em ${atual}. É a prova de que usar o protocolo mudou algo real.`,
  comparacaoEstavel: (atual: string) => `Seu risco continua em ${atual}, o mesmo do diagnóstico — sem sinal de piora.`,
  comparacaoPiorou: (inicial: string, atual: string) =>
    `Desde o diagnóstico (${inicial}), seu risco passou pra ${atual}. Vale conversar com seu profissional sobre o que mudou.`,
};

// Auditoria de design (2026-09): "esta leitura ainda não muda sessão a
// sessão nesta versão do beta" falava da perspectiva do software (jargão de
// changelog), não da sua — quebra a voz de coach pra soar como nota de
// desenvolvedor. Reescrito do seu ponto de vista: o que muda essa leitura
// (responder de novo), não por que ela ainda não mudou (o software é beta).
export const bemEstarCaption =
  "É a leitura do seu diagnóstico. Ela volta a mudar quando você responder de novo — não a cada sessão.";

// RF-7 do PRD de Psicologia do Esporte — depois do primeiro check-in
// periódico, o card deixa de ser um retrato estático do diagnóstico e passa
// a atualizar a cada resposta (lib/psicologia/queries.ts, getResumoBemEstar).
export const bemEstarCaptionAtualizado = "Atualiza a cada check-in de Psicologia do Esporte que você responde.";

// "Nutrição esportiva" e "Psicologia do esporte" saíram desta lista — RF11
// do PRD de Nutrição Esportiva e RF-7 do PRD de Psicologia do Esporte
// substituem esses placeholders por cards reais assim que há dado; ver
// components/painel/GradePilares.tsx.
export const OUTROS_PILARES = [{ nome: "Preparo físico" }, { nome: "Medicina do esporte" }];

// Regra §6: placeholder nunca vazio sem explicação, nunca com data.
//
// Auditoria de design (2026-09): a versão anterior repetia este parágrafo
// inteiro em 4 cards grandes e idênticos — a leitura ficava igual a um
// roadmap genérico de SaaS ("em breve, em breve, em breve, em breve").
// Agora o parágrafo aparece uma vez só; cada pilar vira uma linha compacta
// (GradePilares.tsx), não mais um card do mesmo peso visual dos cards de
// dado real acima.
export const copyPilarChegando =
  "Chegando, um de cada vez. Quando um pilar estiver pronto, ele aparece aqui — sem você precisar mexer em nada do resto do seu painel.";
