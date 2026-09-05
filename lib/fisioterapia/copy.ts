// Copy do pilar de Prescrição Clínica — textos exatos definidos em §7 e §8 do
// PRD de arquitetura de produto. Centralizado aqui para não divergir entre
// telas, e porque erro/sucesso/vazio seguem a mesma regra de voz de marca em
// todo o produto (--fire para erro, ícone de check para sucesso — nunca cor).

export const onboarding = {
  // QA (feedback da Marina): rótulo desta seção renomeado de "Seu Protocolo"
  // pra "Treinos Recomendados" — mesmo ajuste do h1 da página e do item de
  // menu (lib/nav-config.ts). "Protocolo"/"recuperação" reforçavam o mito
  // de que fisioterapia é só reabilitação de lesão; a marca é sobre
  // fortalecimento.
  eyebrow: "TREINOS RECOMENDADOS",
  titulo: "Isso aqui não é um plano de treino.",
  tituloDestaque: "É o retorno sendo acompanhado de verdade.",
  corpo:
    "Cada sessão que aparece aqui foi pensada por um profissional, a partir do seu histórico — não de uma tabela genérica. Depois de cada sessão, um check rápido de \"como foi\" ajuda o protocolo a se ajustar a você. E, com o tempo, esta tela vai te mostrar, em número, o que já mudou no seu corpo.",
  cta: "Ver minha sessão",
};

export const corredorCopy = {
  vazioSemSessao:
    "Seu protocolo ainda está sendo desenhado. Assim que o profissional finalizar sua avaliação, sua primeira sessão aparece aqui.",
  vazioEvolucao:
    "Ainda não há medição suficiente para mostrar evolução. Isso não é ruim — é cedo. Depois da próxima avaliação, essa tela começa a contar uma história com número.",
  loading: "Carregando seu protocolo.",
  loadingEvolucao: "Carregando sua evolução.",
  erroGenerico:
    "Não conseguimos carregar sua sessão agora. Não é nada que você fez — tenta de novo em instantes.",
  sucessoResposta24h: "Registrado. Isso vai direto para quem está cuidando do seu retorno.",
};

export const profissionalCopy = {
  vazioPacientes: "Nenhum paciente com atendimento aberto. Busque um corredor para iniciar.",
  loadingProntuario: "Carregando prontuário.",
  erroSalvarAtendimento:
    "Não foi possível salvar agora. O que você digitou continua no formulário — nada foi perdido. Tenta salvar de novo.",
  sucessoSessaoEnviada: "Sessão enviada. Já está visível para o corredor.",
  sucessoAtendimentoFinalizado: "Atendimento finalizado e registrado no prontuário.",
};
