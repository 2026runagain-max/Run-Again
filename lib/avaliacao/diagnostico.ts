// RF04 — cálculo determinístico do diagnóstico inicial.
//
// Pesos e limiares abaixo são uma decisão desta implementação, não da
// estratégia aprovada: prds/fluxo-2-onboarding-avaliacao-diagnostico.md (que
// define "as regras determinísticas de score/perfil já definidas na
// estratégia", §5 do documento de arquitetura) não está neste repositório.
// A lógica segue as regras de negócio que O DOCUMENTO DE ARQUITETURA fixa
// (§6): nenhum score sem frase, carga de vida entra como sinal qualitativo
// dentro da frase (nunca número isolado), máximo 3 pontos de atenção
// ordenados por peso, diagnóstico é hipótese e nunca usa linguagem de "erro"
// sobre decisão passada. Revisar os pesos com produto contra o texto exato
// daquele documento assim que ele existir no repositório.
//
// Roda inteiramente no servidor (RF04-CA3) — nunca no client.

import type {
  BandaRisco,
  Diagnostico,
  PontoAtencao,
  RespostasAvaliacao,
} from "./types";
import type { Persona } from "@/lib/types";

interface Flag {
  chave: string;
  peso: number; // contribuição ao risco (0-100)
  titulo: string;
  texto: string;
}

const REGIAO_LABEL: Record<string, string> = {
  joelho: "joelho",
  tornozelo_pe: "tornozelo/pé",
  quadril_virilha: "quadril/virilha",
  posterior_coxa: "posterior de coxa",
  lombar: "lombar",
  canela_panturrilha: "canela/panturrilha",
  outra: "essa região",
};

function coletarFlags(respostas: RespostasAvaliacao): Flag[] {
  const flags: Flag[] = [];
  const { blocoA, blocoB, blocoC, blocoD, blocoE, blocoF } = respostas;

  // Bloco A — histórico de lesão.
  if (blocoA?.houveLesao === "sim") {
    flags.push({
      chave: "lesao_historico",
      peso: 15,
      titulo: "Histórico de lesão recente",
      texto: `Você teve uma lesão em ${REGIAO_LABEL[blocoA.regiaoLesao ?? "outra"]} nos últimos 12 meses — o protocolo parte disso, não ignora.`,
    });

    if (blocoA.situacaoAtualLesao === "ainda_me_limita") {
      flags.push({
        chave: "lesao_ativa",
        peso: 25,
        titulo: "Lesão ainda ativa",
        texto: `${REGIAO_LABEL[blocoA.regiaoLesao ?? "outra"]} ainda te limita no dia a dia — isso pede atenção prioritária antes de qualquer progressão de carga.`,
      });
    } else if (blocoA.situacaoAtualLesao === "ainda_sinto_as_vezes") {
      flags.push({
        chave: "lesao_residual",
        peso: 12,
        titulo: "Sintoma residual",
        texto: `Você ainda sente algo em ${REGIAO_LABEL[blocoA.regiaoLesao ?? "outra"]} de vez em quando — vale monitorar de perto no retorno.`,
      });
    }

    if (blocoA.tratamentoLesao === "nao_tratou") {
      flags.push({
        chave: "lesao_sem_tratamento",
        peso: 10,
        titulo: "Lesão sem tratamento formal",
        texto: "Essa lesão não teve acompanhamento profissional — não é falha sua, mas é algo pro seu profissional saber antes de tudo.",
      });
    }

    if (blocoA.tempoParado === "mais_6_meses") {
      flags.push({
        chave: "tempo_parado_longo",
        peso: 8,
        titulo: "Tempo parado prolongado",
        texto: "Você ficou mais de 6 meses sem correr por causa disso — o retorno pede progressão mais gradual, não menos capacidade.",
      });
    }
  }

  // Bloco D — sono.
  if (blocoD?.qualidadeSono === "ruim") {
    flags.push({
      chave: "sono_ruim",
      peso: 10,
      titulo: "Sono comprometido",
      texto: "Seu sono está ruim agora — é a base da recuperação, e sem ela o corpo absorve pior qualquer estímulo de treino.",
    });
  } else if (blocoD?.qualidadeSono === "regular") {
    flags.push({
      chave: "sono_regular",
      peso: 4,
      titulo: "Sono irregular",
      texto: "Seu sono está regular — não é motivo de alarme, mas é uma variável que vale observar.",
    });
  }

  // Bloco E — medo de lesionar.
  if (blocoE) {
    if (blocoE.medoLesionar >= 7) {
      flags.push({
        chave: "medo_alto",
        peso: 12,
        titulo: "Medo de lesionar pesa bastante",
        texto: "O medo de se machucar de novo pesa forte quando você pensa em treinar — isso é dado real, não frescura, e molda o ritmo certo pra você.",
      });
    } else if (blocoE.medoLesionar >= 4) {
      flags.push({
        chave: "medo_moderado",
        peso: 6,
        titulo: "Algum receio de lesionar",
        texto: "Existe um receio moderado de se lesionar de novo — normal em quem já passou por isso, e algo bom de nomear com o profissional.",
      });
    }
  }

  // Bloco F — carga de vida / rotina (sinal qualitativo, nunca número
  // isolado — §6 do documento de arquitetura). O título usa o termo "carga
  // de vida" de propósito: é vocabulário próprio do Run Again, não
  // "estresse" ou "rotina corrida" genéricos.
  if (blocoF?.desafioRotina === "cansaco_estresse") {
    flags.push({
      chave: "carga_vida_estresse",
      peso: 8,
      titulo: "Carga de vida alta",
      texto: "Cansaço e estresse são o maior desafio da sua rotina agora — isso conta tanto quanto qualquer treino na conta da sua recuperação.",
    });
  } else if (blocoF?.desafioRotina === "falta_tempo") {
    flags.push({
      chave: "carga_vida_tempo",
      peso: 5,
      titulo: "Carga de vida apertada no tempo",
      texto: "Falta de tempo é o maior desafio da sua rotina — o protocolo certo é o que cabe no tempo que você realmente tem, não no tempo que você gostaria de ter.",
    });
  }

  // Mismatch entre disponibilidade de tempo e objetivo (regra §6 do
  // documento de arquitetura: "mismatch entre disponibilidade de tempo e
  // objetivo" entra no score de risco via o sinal qualitativo do bloco F).
  const objetivoAmbicioso = blocoB?.objetivoPrincipal === "melhorar_tempo" || blocoB?.objetivoPrincipal === "completar_prova";
  const prazoCurto = blocoB?.prazoObjetivo === "3_meses";
  if (objetivoAmbicioso && prazoCurto && blocoF?.tempoDisponivelSemana === "menos_2h") {
    flags.push({
      chave: "mismatch_tempo_objetivo",
      peso: 15,
      titulo: "Meta e tempo disponível não combinam ainda",
      texto: "Sua meta tem prazo curto, mas o tempo semanal disponível é pouco — vale alinhar expectativa com o profissional antes de acelerar.",
    });
  }

  // Baixa frequência atual + prazo curto.
  if (blocoC?.frequenciaSemanal === "nao_treino_agora" && prazoCurto) {
    flags.push({
      chave: "base_baixa_prazo_curto",
      peso: 10,
      titulo: "Base de treino baixa para o prazo",
      texto: "Você não está treinando agora e mira um prazo curto — dá pra chegar lá, com progressão bem calibrada desde o início.",
    });
  }

  return flags;
}

// Exportada: o painel de progresso (RF06) reaproveita o mesmo limiar pra
// recalcular a banda depois de somar os sinais de zona/aderência do
// período — "mesma lógica de threshold do Fluxo 2", regra §5 do PRD de
// painel. Nunca duplicar 55/25 em outro arquivo.
export function calcularBanda(score: number): BandaRisco {
  if (score >= 55) return "alto";
  if (score >= 25) return "moderado";
  return "baixo";
}

const FRASE_BANDA: Record<BandaRisco, (persona: Persona | null) => string> = {
  baixo: () =>
    "Seu ponto de partida está sólido. Isso não é sinal verde pra pular etapa — é a base certa pra progredir com consistência.",
  moderado: () =>
    "Existem alguns pontos que pedem atenção no seu retorno — nada que impeça você de avançar, desde que o ritmo respeite o que seu corpo está contando.",
  alto: () =>
    "Seu retorno pede cuidado redobrado agora — não porque você não vai chegar lá, mas porque o jeito de chegar importa. Isso não é sobre pegar leve com você: é sobre pegar certo, e é por isso que essa conversa com um profissional vem antes de qualquer progressão de carga.",
};

function calcularPerfilBiomecanico(respostas: RespostasAvaliacao): { flags: string[]; frase: string } {
  const { blocoA } = respostas;

  if (!blocoA || blocoA.houveLesao !== "sim") {
    return {
      flags: [],
      frase:
        "Você não relatou lesão nos últimos 12 meses — hipótese inicial é de base estrutural preservada. Isso é autorrelato, não avaliação física: o profissional confirma isso na prática.",
    };
  }

  const regiao = REGIAO_LABEL[blocoA.regiaoLesao ?? "outra"];
  const ativa = blocoA.situacaoAtualLesao === "ainda_me_limita";
  const residual = blocoA.situacaoAtualLesao === "ainda_sinto_as_vezes";

  const flags = [`historico_${blocoA.regiaoLesao ?? "outra"}`];
  if (ativa) flags.push("sintoma_ativo");
  if (residual) flags.push("sintoma_residual");

  let frase: string;
  if (ativa) {
    frase = `Hipótese inicial aponta possível fragilidade ainda ativa em ${regiao} — é autorrelato, não avaliação física, e é exatamente o que a primeira conversa com o profissional vai investigar de perto.`;
  } else if (residual) {
    frase = `Hipótese inicial aponta uma região historicamente sensível (${regiao}), com sintoma residual — vale confirmar na prática se ainda limita algum movimento.`;
  } else {
    frase = `Hipótese inicial é de ${regiao} historicamente sensível, mas hoje resolvida — o profissional confirma se a base já está pronta pra progressão plena.`;
  }

  return { flags, frase };
}

const RECEIO_LABEL: Record<string, string> = {
  nova_lesao: "o medo de se machucar de novo",
  nao_evoluir_como_antes: "a preocupação de não voltar a ser como antes",
  nao_atingir_meta: "a preocupação de não atingir a meta",
  frustracao_com_processo: "o receio de se frustrar com o processo",
  nada_disso_me_preocupa: "nenhum receio específico declarado",
};

const MOTIVACAO_LABEL: Record<string, string> = {
  saude_bem_estar: "saúde e bem-estar",
  superacao_pessoal: "superação pessoal",
  performance_competitiva: "performance competitiva",
  disciplina_rotina: "disciplina e rotina",
  comunidade_pertencimento: "comunidade e pertencimento",
};

function calcularPerfilPsicologico(respostas: RespostasAvaliacao, persona: Persona | null): string {
  const { blocoE } = respostas;
  if (!blocoE) {
    return "Ainda não há sinal suficiente sobre o lado psicológico do seu retorno — o profissional aprofunda isso na primeira conversa.";
  }

  const motivacao = MOTIVACAO_LABEL[blocoE.motivacaoPrincipal];
  const receio = RECEIO_LABEL[blocoE.receioPrincipal];
  const medoAlto = blocoE.medoLesionar >= 7;
  const medoModerado = blocoE.medoLesionar >= 4 && blocoE.medoLesionar < 7;

  if (blocoE.receioPrincipal === "nada_disso_me_preocupa" && !medoAlto && !medoModerado) {
    return `O que mais te move agora é ${motivacao} — sem receio declarado no momento. Isso é ótimo ponto de partida, mas não dispensa progressão respeitada.`;
  }

  if (medoAlto) {
    const base = `${receio.charAt(0).toUpperCase()}${receio.slice(1)} pesa bastante quando você pensa em treinar — isso é dado real, não é frescura, e é um sinal pra ouvir, não pra ignorar.`;
    if (persona === "returnista") {
      return `${base} Faz sentido depois do que você já passou — o protocolo certo é o que constrói confiança junto com capacidade física.`;
    }
    return base;
  }

  if (medoModerado) {
    return `Existe um receio moderado ligado a ${receio}, ao lado de uma motivação forte em ${motivacao} — equilíbrio comum, e bom de nomear com quem vai te acompanhar.`;
  }

  return `O que mais te move agora é ${motivacao}, com pouco peso de receio no momento — uma base emocional favorável pra progressão.`;
}

/**
 * Frase de identidade — o primeiro parágrafo que a Returnista lê no
 * diagnóstico, e a razão de ser deste fluxo (§1 do PRD: "a primeira vez que
 * o manifesto aparece como comportamento de produto, não como frase de
 * marca"). Nomeia quem a pessoa é com o vocabulário próprio do Run Again
 * (Returnista) e, quando o sinal aparece nas respostas, nomeia
 * explicitamente a cobrança de performance sobre um hobby — o ângulo que
 * nenhum concorrente nomeia. Nunca reaproveitar como rótulo curto: é
 * escrita pra ser lida como reconhecimento, não como categoria.
 */
function calcularFraseIdentidade(respostas: RespostasAvaliacao, persona: Persona | null): string {
  const { blocoB, blocoE } = respostas;

  const querPerformar =
    blocoB?.objetivoPrincipal === "melhorar_tempo" ||
    blocoB?.objetivoPrincipal === "completar_prova" ||
    blocoE?.motivacaoPrincipal === "performance_competitiva";

  const carregaCobranca =
    blocoE?.receioPrincipal === "nao_atingir_meta" ||
    blocoE?.receioPrincipal === "frustracao_com_processo" ||
    (blocoE?.medoLesionar ?? 0) >= 6;

  if (persona === "returnista") {
    if (carregaCobranca) {
      return "Você é uma Returnista: já sabe o preço de errar de novo, e carrega esse peso toda vez que pensa em treinar forte outra vez. Isso não é fraqueza — é memória do corpo fazendo o trabalho dela.";
    }
    return "Você é uma Returnista: já esteve aqui antes, parou, e está voltando de olhos abertos. Isso muda como a gente te acompanha desde a primeira sessão.";
  }

  if (persona === "amador_ambicioso") {
    if (querPerformar && carregaCobranca) {
      return "Você se cobra por performance numa coisa que, pra muita gente, é \"só\" um hobby — e essa cobrança é real, mesmo que quase ninguém nomeie isso. Aqui ela não é ignorada: é dado.";
    }
    if (querPerformar) {
      return "Você quer evoluir de verdade, não só participar — e essa ambição sobre a própria corrida não é exagero seu. É exatamente o que a gente veio construir com você.";
    }
    return "Você já corre com regularidade e agora quer dar o próximo passo, no seu ritmo — sem virar sacrifício.";
  }

  // iniciante_consciente
  if (carregaCobranca) {
    return "Você está começando prestando atenção no que o corpo pede, não só copiando o que vê por aí — inclusive na parte de já temer errar antes mesmo de tentar. Isso conta a seu favor, não contra.";
  }
  return "Você está começando pelo caminho mais difícil: com atenção, não só com vontade. É isso que evita que o começo vire a razão de parar de novo.";
}

/**
 * RF04 — calcula o diagnóstico completo a partir das respostas dos Blocos
 * A–H. Determinístico: mesma entrada sempre produz a mesma saída, sem
 * chamada a modelo/IA (LATER — item 15 do PRD de produto).
 */
export function calcularDiagnostico(respostas: RespostasAvaliacao, persona: Persona | null): Diagnostico {
  const flags = coletarFlags(respostas);
  const riscoScore = Math.min(100, flags.reduce((soma, f) => soma + f.peso, 0));
  const bandaRisco = calcularBanda(riscoScore);

  // RF04-CA4 — no máximo 3 pontos de atenção, os de maior peso.
  const pontosAtencao: PontoAtencao[] = [...flags]
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 3)
    .map((f) => ({ titulo: f.titulo, texto: f.texto }));

  const biomecanico = calcularPerfilBiomecanico(respostas);

  return {
    riscoScore,
    bandaRisco,
    fraseIdentidade: calcularFraseIdentidade(respostas, persona),
    bandaRiscoFrase: FRASE_BANDA[bandaRisco](persona),
    perfilBiomecanicoFlags: biomecanico.flags,
    perfilBiomecanicoFrase: biomecanico.frase,
    perfilPsicologicoFrase: calcularPerfilPsicologico(respostas, persona),
    pontosAtencao:
      pontosAtencao.length > 0
        ? pontosAtencao
        : [
            {
              titulo: "Nenhum ponto crítico identificado agora",
              texto: "Suas respostas não acenderam nenhum sinal de atenção prioritário — o profissional ainda assim revisa tudo na primeira conversa.",
            },
          ],
  };
}

/** RF03-CA1 — campos obrigatórios do Bloco A dependem de houveLesao. */
export function blocoACompleto(bloco: RespostasAvaliacao["blocoA"]): boolean {
  if (!bloco) return false;
  if (bloco.houveLesao === "nao") return true;
  return (
    bloco.houveLesao === "sim" &&
    !!bloco.regiaoLesao &&
    !!bloco.tratamentoLesao &&
    !!bloco.situacaoAtualLesao &&
    !!bloco.tempoParado
  );
}
