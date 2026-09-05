// M09 — Guia de alimentação ao redor do treino (RF05).
//
// Deliberadamente FORA de lib/nutricao/motor.ts, mesmo sendo "M09" na
// numeração do PRD: motor.ts carrega import "server-only" porque M03–M08 são
// o motor clínico (nunca pode ser bundlado pro client — regra §3.3 da
// arquitetura global, reforçada no PRD deste fluxo). M09, ao contrário, é
// "lógica de seleção, conteúdo já versionado como dado estático" por
// desenho explícito do PRD (tabela de Inputs/Processamento/Output, linha
// "Selecionar bloco de alimentação ao redor do treino") — e
// components/nutricao/GuiaAlimentacaoTreino.tsx (Client Component) precisa
// importar isto diretamente para reagir ao toque do corredor sem round-trip
// ao servidor. Ficar no mesmo arquivo do motor arriscaria vazar M03–M08 pro
// bundle do client por associação — por isso este corte de arquivo existe.

export type ContextoTreinoHoje = "sem_treino_hoje" | "treino_curto" | "treino_longo" | "prova" | "pos_treino";

export interface BlocoAlimentacaoTreino {
  titulo: string;
  itens: { refeicao: string; sugestao: string }[];
  nota: string;
}

// RF05-CA3: sempre mais de uma opção por bloco, nunca refeição obrigatória.
// RF05-CA2 (FLEXIBLE_MEAL): nada aqui aciona restrição — é sempre sugestão,
// nunca regra a cumprir.
const BLOCOS_ALIMENTACAO_TREINO: Record<ContextoTreinoHoje, BlocoAlimentacaoTreino> = {
  sem_treino_hoje: {
    titulo: "Hoje é dia de descanso",
    itens: [
      { refeicao: "Ao longo do dia", sugestao: "Priorize proteína e vegetais — é o dia em que o corpo absorve o treino anterior." },
      { refeicao: "Ao longo do dia", sugestao: "Reduza um pouco o carboidrato comparado a um dia de treino, sem cortar de vez." },
    ],
    nota: "Nenhuma refeição aqui é obrigatória — são sugestões pra um dia sem treino, não uma regra a cumprir.",
  },
  treino_curto: {
    titulo: "Treino curto ou leve hoje",
    itens: [
      { refeicao: "1–2h antes", sugestao: "Uma fruta ou uma torrada com algo leve já é suficiente." },
      { refeicao: "Depois", sugestao: "Sua próxima refeição normal já cobre a recuperação — nada especial é necessário." },
    ],
    nota: "Treino leve pede pouco preparo alimentar — o corpo já tem reserva suficiente pra isso.",
  },
  treino_longo: {
    titulo: "Treino longo hoje",
    itens: [
      { refeicao: "2–3h antes", sugestao: "Refeição rica em carboidrato de fácil digestão (arroz, batata, pão, fruta)." },
      { refeicao: "Durante (se passar de 90 min)", sugestao: "Gel, fruta seca ou isotônico a cada 45–60 minutos." },
      { refeicao: "Até 60 min depois", sugestao: "Combine carboidrato e proteína — um sanduíche, iogurte com fruta, ou uma refeição normal adiantada." },
    ],
    nota: "Escolha o que já funciona pro seu estômago — testar algo novo é melhor fora do dia de treino longo.",
  },
  prova: {
    titulo: "Dia de prova",
    itens: [
      { refeicao: "Na véspera", sugestao: "Jantar com mais carboidrato que o normal, sem exagerar em fibra ou gordura." },
      { refeicao: "2–3h antes da largada", sugestao: "Café da manhã já testado em treino — nunca algo novo no dia da prova." },
      { refeicao: "Durante", sugestao: "Siga a estratégia de reposição que você já testou nos treinos longos." },
    ],
    nota: "Regra de ouro: nada novo no dia da prova — só o que o seu corpo já reconhece dos treinos.",
  },
  pos_treino: {
    titulo: "Você acabou de treinar",
    itens: [
      { refeicao: "Até 60 minutos", sugestao: "Combine carboidrato e proteína — chocolate com leite, iogurte com fruta, ou sua próxima refeição adiantada." },
      { refeicao: "Ao longo do dia", sugestao: "Beba água com calma até a urina voltar a ficar clara." },
    ],
    nota: "A janela de 60 minutos ajuda, mas não é uma regra rígida — comer bem no dia inteiro pesa mais que o minuto exato.",
  },
};

export function selecionarBlocoAlimentacaoTreino(contexto: ContextoTreinoHoje): BlocoAlimentacaoTreino {
  return BLOCOS_ALIMENTACAO_TREINO[contexto];
}
