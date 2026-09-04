// Copy do pilar de Psicologia do Esporte — texto exato de §7 e §8 do PRD de
// arquitetura de produto. Centralizado aqui pra não divergir entre telas —
// mesma convenção de lib/fisioterapia/copy.ts e lib/nutricao/copy.ts.
// --fire só pra erro, ícone de check pra sucesso — nunca cor de semáforo
// pra zona (mesma regra já registrada em ZonaBadge, reaproveitado aqui).

// Nome exibido em toda a copy do corredor (§7/§8 citam "[nome do
// psicólogo]"). Configurável — trocar assim que a psicóloga responsável
// pelo beta estiver definida oficialmente, mesma decisão já registrada em
// lib/nutricao/motor.ts (NUTRICIONISTA_RESPONSAVEL_NOME).
export const NOME_PSICOLOGO_PADRAO = "quem cuida da sua cabeça no retorno";

export const onboardingPsicologia = {
  eyebrow: "SEU ACOMPANHAMENTO",
  titulo: "A cabeça também faz parte",
  tituloDestaque: "do protocolo.",
  corpo: (nomePsicologo: string) =>
    `De tempos em tempos, vamos te perguntar como você está por dentro — não é burocracia, é ${nomePsicologo} acompanhando de verdade se o medo está diminuindo junto com a dor. Leva menos de um minuto. E se em algum momento você quiser conversar antes disso, o botão pra isso está sempre aqui.`,
  cta: "Responder agora",
};

export const corredorCopy = {
  vazioAindaNaoChegou:
    "Seu próximo check-in chega em alguns dias. Enquanto isso, seu protocolo segue seu curso normal.",
  vazioSemElegibilidadeTitulo: "Ainda não é possível responder ao check-in.",
  vazioSemElegibilidadeSubtitulo:
    "Seu check-in de Psicologia do Esporte começa a existir depois que seu diagnóstico inicial está concluído.",
  loading: "Carregando seu check-in.",
  erroEnvio: "Não conseguimos registrar agora. O que você escreveu continua aqui — nada foi perdido. Tenta de novo.",
  ctaFalarAgora: "Quero falar agora, não preciso esperar",
};

// Sucesso — zona verde/amarela/vermelha (§8). Amarela e vermelha
// compartilham o mesmo texto no PRD — a zona já está com o profissional,
// não é a Returnista quem precisa decidir o quanto isso pesa.
export const confirmacaoPorZona: Record<"verde" | "amarela" | "vermelha", (nomePsicologo: string) => string> = {
  verde: (nome) => `Registrado. Isso vai direto pra ${nome} — não fica só guardado.`,
  amarela: (nome) =>
    `Registrado. Sua confiança está mais baixa que da última vez — isso é exatamente o tipo de coisa que a Psicologia do Esporte existe para acompanhar de perto. ${nome} vai te procurar.`,
  vermelha: (nome) =>
    `Registrado. Sua confiança está mais baixa que da última vez — isso é exatamente o tipo de coisa que a Psicologia do Esporte existe para acompanhar de perto. ${nome} vai te procurar.`,
};

// Sucesso — C5 = "sim, gostaria de conversar" (§8). Vence a copy de zona
// (mesma regra de negócio do cálculo: pedido direto sempre vence).
export const confirmacaoPrioridade = (nomePsicologo: string) =>
  `Registrado — e marcado como prioridade. Você não precisa esperar o próximo check-in. ${nomePsicologo} foi avisado agora.`;

// Variante de confirmacaoPorZona pra quando a zona amarela/vermelha vem do
// PRIMEIRO check-in periódico de todos (sem check-in anterior pra comparar)
// — a copy literal do §8 do PRD ("sua confiança está mais baixa que da
// última vez") pressupõe uma comparação que não existe nesse caso (RF-2-CA1:
// zona aqui vem de piso/teto absoluto, não de delta). Mesmo tom e mesma
// consequência (a Psicologia do Esporte já está olhando), sem afirmar uma
// queda que não aconteceu.
export const confirmacaoPrimeiraVezAtencao = (nomePsicologo: string) =>
  `Registrado. Isso já é exatamente o tipo de sinal que a Psicologia do Esporte existe para acompanhar de perto. ${nomePsicologo} vai te procurar.`;

export const profissionalCopy = {
  vazioFila: "Nenhum sinal pendente agora. Isso é bom — significa que ninguém está esperando por você.",
  loadingProntuario: "Carregando prontuário.",
  erroSalvarAtendimento:
    "Não foi possível salvar agora. O que você digitou continua no formulário — nada foi perdido. Tenta salvar de novo.",
  sucessoAtendimentoFinalizado: "✓ Atendimento finalizado e registrado no prontuário.",
  secaoTranquilos: "Sem sinal pendente",
};

// RF-6-CA1 — prefixo fixo do badge no prontuário de fisioterapia; o restante
// vem de fraseSinalCruzado (lib/psicologia/calculo.ts).
export const badgeSinalCruzadoPrefixo = "Sinal da Psicologia do Esporte";
