// Motor de Nutrição Esportiva — M03 (triagem) a M10 (status de monitoramento).
//
// ---------------------------------------------------------------------------
// LEIA ANTES DE MEXER — status desta implementação
// ---------------------------------------------------------------------------
// O PRD (Arquitetura de Produto — Nutrição Esportiva) trata
// claude/motor-nutricao-esportiva-especificacao.md como "fonte única de
// verdade clínica": fórmulas exatas de energia/macro/hidratação/
// suplementação, flags de triagem e faixas de validação, assinadas pela
// nutricionista responsável. Esse arquivo não existe neste repositório.
//
// As fórmulas abaixo são heurísticas conservadoras e amplamente
// documentadas de nutrição esportiva geral (Mifflin-St Jeor para BMR,
// faixas de g/kg do ACSM/ISSN para carboidrato e proteína, screening
// inspirado nos critérios de RED-S/IOC para a triagem de segurança) —
// escolhidas para que o produto seja genuinamente funcional ponta a ponta
// no beta, nunca para substituir a validação clínica real. CADA constante
// abaixo está comentada com sua origem e é fácil de trocar por um valor
// vindo do documento real assim que ele existir.
//
// NÃO apresentar nenhum resultado deste motor como "validado pela
// nutricionista da equipe" até uma nutricionista revisar este arquivo linha
// a linha — a tela (lib/nutricao/copy.ts) já é escrita para não prometer
// isso incondicionalmente (rótulo de autoria fica com o nome configurado
// em NUTRICIONISTA_RESPONSAVEL_NOME, que deve ser preenchido no dia em que
// isso acontecer de verdade).
//
// Desvio de arquitetura (documentado em
// supabase/migrations/0006_nutricao_esportiva.sql, topo do arquivo): o PRD
// descreve isto rodando num serviço Python/FastAPI separado, chamado pelo
// Fastify. Este repositório não tem Fastify nem um serviço Python — é um
// único app Next.js. Este módulo roda inteiramente no servidor (nenhuma
// destas funções é importada por um Client Component) e só é chamado a
// partir de server actions (lib/nutricao/actions.ts) — nunca diretamente
// pelo client, preservando a MESMA fronteira de segurança que
// arquitetura-tecnica-global.md §3.3 exige, só que dentro de um processo em
// vez de dois. Extrair isto para um serviço Python real no futuro é trocar
// quem chama estas funções puras, não reescrever a lógica.
// ---------------------------------------------------------------------------

import "server-only";
import type { FrequenciaSemanal } from "@/lib/avaliacao/types";
import type {
  BlocoAlimentar,
  BlocoBiometria,
  BlocoComportamento,
  BlocoDigestivo,
  BlocoObjetivo,
  BlocoSaudeMenstrual,
  EnergiaOrientacao,
  FlagTriagem,
  HidratacaoOrientacao,
  MacrosDia,
  MacrosOrientacao,
  NivelAutomacaoNutricao,
  SuplementacaoOrientacao,
  TimingOrientacao,
  TipoDia,
} from "./types";

export const MOTOR_VERSAO = "placeholder-heuristico-2026-09";

// Nome exibido no rótulo de autoria (regra §6: "ao lado de cada número, o
// nome de quem escreveu a regra"). Configurável — trocar assim que a
// nutricionista responsável estiver definida oficialmente para o beta.
export const NUTRICIONISTA_RESPONSAVEL_NOME = "Equipe Run Again";

// ---------------------------------------------------------------------------
// M03 — Triagem de segurança e roteamento de automação
// ---------------------------------------------------------------------------

export interface EntradaTriagem {
  biometria: BlocoBiometria;
  objetivo: BlocoObjetivo;
  alimentar: BlocoAlimentar;
  digestivo: BlocoDigestivo;
  comportamento: BlocoComportamento;
  saudeMenstrual: BlocoSaudeMenstrual | null; // null quando não se aplica (RF01-CA2)
}

export interface ResultadoTriagem {
  nivel: NivelAutomacaoNutricao;
  flags: FlagTriagem[];
}

export function calcularImc(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
}

/**
 * M03 — nunca roda no client, nunca é pulada (RF02-CA1/CA3): toda orientação
 * numérica passa por aqui antes de M04–M08 rodar. Hard stops (flag vermelha)
 * e combinação de flags amarelas (2+) bloqueiam o cálculo automático e
 * roteiam para N4 — regra de maior peso do PRD (§6, primeiro item).
 */
export function calcularTriagem(entrada: EntradaTriagem): ResultadoTriagem {
  const { biometria, objetivo, alimentar, digestivo, comportamento, saudeMenstrual } = entrada;

  if (
    !biometria ||
    !Number.isFinite(biometria.pesoKg) ||
    !Number.isFinite(biometria.alturaCm) ||
    !Number.isFinite(biometria.idade)
  ) {
    // Defensivo — o wizard já exige estes campos antes de concluir
    // (RF01-CA3); isto só protege contra uma chamada fora do fluxo normal.
    return {
      nivel: "n2",
      flags: [
        {
          chave: "dado_biometrico_incompleto",
          gravidade: "amarela",
          titulo: "Dado insuficiente para calcular",
          explicacao: "Faltam informações básicas (peso, altura ou idade) para o motor calcular sua orientação.",
        },
      ],
    };
  }

  const imc = calcularImc(biometria.pesoKg, biometria.alturaCm);
  const vermelhas: FlagTriagem[] = [];
  const amarelas: FlagTriagem[] = [];

  // WEIGHT_LOSS_ELIGIBILITY (regra §6 do PRD, citada nominalmente): nenhuma
  // orientação de déficit calórico é gerada automaticamente, mesmo com
  // objetivo de emagrecimento declarado. Em vez de tentar calcular um
  // déficit "seguro" sem revisão clínica, o motor bloqueia antes de
  // qualquer número existir.
  if (objetivo.objetivoNutricional === "emagrecimento") {
    vermelhas.push({
      chave: "objetivo_emagrecimento",
      gravidade: "vermelha",
      titulo: "Objetivo de emagrecimento",
      explicacao:
        "Nenhuma orientação de déficit calórico é calculada automaticamente pelo motor — esse objetivo sempre passa por uma avaliação da equipe antes de qualquer número.",
    });
  }

  if (comportamento.historicoRestricaoAlimentar === "sim" && comportamento.comportamentoCompensatorio === "sim") {
    vermelhas.push({
      chave: "padrao_alimentar_restritivo_ativo",
      gravidade: "vermelha",
      titulo: "Padrão alimentar restritivo em curso",
      explicacao: "As respostas indicam histórico de restrição alimentar somado a comportamento compensatório — pede avaliação humana antes de qualquer orientação numérica.",
    });
  }

  if (comportamento.preocupacaoComPeso >= 8 && comportamento.comportamentoCompensatorio === "sim") {
    vermelhas.push({
      chave: "preocupacao_peso_alta_com_compensacao",
      gravidade: "vermelha",
      titulo: "Preocupação alta com peso, com comportamento compensatório",
      explicacao: "A combinação de preocupação alta com peso e comportamento compensatório pede avaliação de perto da equipe.",
    });
  }

  if (saudeMenstrual?.regularidadeCiclo === "ausente_amenorreia") {
    vermelhas.push({
      chave: "amenorreia",
      gravidade: "vermelha",
      titulo: "Ausência de ciclo menstrual",
      explicacao: "Ausência de ciclo por 3 meses ou mais pode sinalizar disponibilidade energética baixa — pede avaliação da equipe antes de qualquer orientação calculada.",
    });
  }

  if (biometria.idade < 18) {
    vermelhas.push({
      chave: "menor_de_idade",
      gravidade: "vermelha",
      titulo: "Corredor menor de idade",
      explicacao: "Orientação nutricional para menores de idade sempre passa por avaliação humana neste beta.",
    });
  }

  if (imc < 17.5) {
    vermelhas.push({
      chave: "imc_muito_baixo",
      gravidade: "vermelha",
      titulo: "Índice de massa corporal muito baixo",
      explicacao: "O IMC calculado está numa faixa que pede avaliação da equipe antes de qualquer orientação automática.",
    });
  }

  if (alimentar.padraoAlimentar === "restricao_medica") {
    vermelhas.push({
      chave: "restricao_medica_declarada",
      gravidade: "vermelha",
      titulo: "Restrição médica declarada",
      explicacao: "Uma restrição alimentar de origem médica pede orientação individualizada da equipe, não um cálculo genérico.",
    });
  }

  if (comportamento.preocupacaoComPeso >= 5 && comportamento.preocupacaoComPeso < 8) {
    amarelas.push({
      chave: "preocupacao_peso_moderada",
      gravidade: "amarela",
      titulo: "Preocupação moderada com peso",
      explicacao: "Existe alguma preocupação com peso nas respostas — sozinha não bloqueia o cálculo, mas soma com outros sinais.",
    });
  }

  if (comportamento.historicoRestricaoAlimentar === "sim" && comportamento.comportamentoCompensatorio === "nao") {
    amarelas.push({
      chave: "historico_restricao_sem_compensacao",
      gravidade: "amarela",
      titulo: "Histórico de restrição alimentar",
      explicacao: "Há histórico de restrição alimentar sem comportamento compensatório ativo declarado.",
    });
  }

  if (saudeMenstrual?.regularidadeCiclo === "irregular") {
    amarelas.push({
      chave: "ciclo_irregular",
      gravidade: "amarela",
      titulo: "Ciclo menstrual irregular",
      explicacao: "O ciclo foi relatado como irregular — vale monitorar junto com a equipe.",
    });
  }

  if (digestivo.desconfortoGiCorrida === "frequente") {
    amarelas.push({
      chave: "desconforto_gi_frequente",
      gravidade: "amarela",
      titulo: "Desconforto digestivo frequente na corrida",
      explicacao: "Desconforto gastrointestinal frequente durante a corrida é um sinal a acompanhar.",
    });
  }

  if (imc >= 17.5 && imc < 18.5) {
    amarelas.push({
      chave: "imc_baixo",
      gravidade: "amarela",
      titulo: "Índice de massa corporal baixo",
      explicacao: "O IMC calculado está abaixo da faixa de referência.",
    });
  }

  if (imc >= 30) {
    amarelas.push({
      chave: "imc_alto",
      gravidade: "amarela",
      titulo: "Índice de massa corporal elevado",
      explicacao: "O IMC calculado está numa faixa que se beneficia de um olhar mais individual da equipe.",
    });
  }

  const todasFlags = [...vermelhas, ...amarelas];

  // Regra §6: "um sinal vermelho interrompe qualquer cálculo" + "combinação
  // de flags amarelas" (§4.3 do motor, citado no PRD) — duas ou mais
  // amarelas também bloqueia, mesmo sem nenhuma vermelha.
  if (vermelhas.length > 0 || amarelas.length >= 2) {
    return { nivel: "n4", flags: todasFlags };
  }

  return { nivel: "n3", flags: todasFlags };
}

// ---------------------------------------------------------------------------
// M04–M08 — Cálculo automático da orientação (só roda quando M03 = N3)
// ---------------------------------------------------------------------------

// Fator de atividade por frequência semanal declarada (Bloco C do Fluxo 2,
// reaproveitado — regra §6: nunca perguntado de novo). Faixa 1.3–1.75,
// aproximação didática do fator de atividade de Harris-Benedict/Mifflin —
// PLACEHOLDER até a tabela real da nutricionista existir.
const FATOR_ATIVIDADE: Record<FrequenciaSemanal, number> = {
  nao_treino_agora: 1.3,
  "1_2x": 1.45,
  "3_4x": 1.6,
  "5x_mais": 1.75,
};

const MULTIPLICADOR_TIPO_DIA: Record<TipoDia, number> = {
  treino_leve: 1.0,
  treino_longo_ou_intenso: 1.1,
  descanso: 0.95,
};

// Ganho de massa: superávit conservador fixo (não um percentual do TDEE) —
// mesma lógica de "nunca mais que o necessário" que rege o limite de
// recálculo (±100–200 kcal/ciclo, ver recalcularOrientacao).
const SUPERAVIT_GANHO_MASSA_KCAL = 300;

function calcularBmr(biometria: BlocoBiometria): number {
  const { pesoKg, alturaCm, idade, sexoBiologico } = biometria;
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  // Mifflin-St Jeor (1990): +5 para homens, -161 para mulheres. Para quem
  // prefere não informar, usa a média dos dois ajustes — nunca pede o dado
  // de novo nem assume um dos dois por padrão.
  if (sexoBiologico === "masculino") return base + 5;
  if (sexoBiologico === "feminino") return base - 161;
  return base - 78;
}

function calcularEnergia(biometria: BlocoBiometria, objetivo: BlocoObjetivo, frequenciaSemanal: FrequenciaSemanal): EnergiaOrientacao {
  const bmr = calcularBmr(biometria);
  const tdee = bmr * FATOR_ATIVIDADE[frequenciaSemanal];
  const superavit = objetivo.objetivoNutricional === "ganho_massa" ? SUPERAVIT_GANHO_MASSA_KCAL : 0;

  const porTipoDia = {
    treino_leve: Math.round(tdee * MULTIPLICADOR_TIPO_DIA.treino_leve + superavit),
    treino_longo_ou_intenso: Math.round(tdee * MULTIPLICADOR_TIPO_DIA.treino_longo_ou_intenso + superavit),
    descanso: Math.round(tdee * MULTIPLICADOR_TIPO_DIA.descanso + superavit),
  };

  const explicacao =
    objetivo.objetivoNutricional === "ganho_massa"
      ? `Sua energia diária parte do seu gasto estimado em repouso e atividade, com um acréscimo de ${SUPERAVIT_GANHO_MASSA_KCAL} kcal — o suficiente pra sustentar ganho de massa sem virar excesso.`
      : "Sua energia diária parte do seu gasto estimado em repouso e atividade, e varia um pouco conforme o tipo de dia — mais em dia de treino longo, um pouco menos em dia de descanso.";

  return { porTipoDia, explicacao };
}

// Faixas de g/kg de peso corporal — ordem de grandeza usual em nutrição
// esportiva de endurance (carboidrato 3–7g/kg conforme demanda do dia,
// proteína 1.2–2.0g/kg). PLACEHOLDER até a tabela real existir.
const CARBOIDRATO_G_KG: Record<TipoDia, number> = {
  treino_leve: 5,
  treino_longo_ou_intenso: 6.5,
  descanso: 3.5,
};
const CARBOIDRATO_G_KG_MINIMO = 3; // piso de segurança — nunca calcula abaixo disto
const PROTEINA_G_KG = 1.5;
const PROTEINA_G_KG_TETO = 2.0; // teto de proteína (validação cruzada, RF03-CA2)
const GORDURA_G_KG_PISO = 0.8; // piso de gordura (validação cruzada, RF03-CA2)

/**
 * Validações cruzadas (RF03-CA2/§6.5 do PRD): piso de gordura, mínimo de
 * carboidrato, teto de proteína. Proteína nunca é reduzida para caber no
 * total de energia (é a variável menos flexível fisiologicamente); o ajuste
 * sempre recai sobre o carboidrato, respeitando o próprio piso dele por
 * último.
 */
function calcularMacrosDoDia(energiaKcal: number, pesoKg: number, tipoDia: TipoDia): MacrosDia {
  const proteinaG = Math.min(PROTEINA_G_KG * pesoKg, PROTEINA_G_KG_TETO * pesoKg);
  let carboidratoG = CARBOIDRATO_G_KG[tipoDia] * pesoKg;

  const kcalProteinaECarbo = proteinaG * 4 + carboidratoG * 4;
  let gorduraG = (energiaKcal - kcalProteinaECarbo) / 9;

  const gorduraPiso = GORDURA_G_KG_PISO * pesoKg;
  if (gorduraG < gorduraPiso) {
    // Piso de gordura violado: sobe a gordura até o piso e absorve a
    // diferença reduzindo carboidrato — nunca proteína.
    const deficitKcal = (gorduraPiso - gorduraG) * 9;
    gorduraG = gorduraPiso;
    carboidratoG = Math.max(CARBOIDRATO_G_KG_MINIMO * pesoKg, carboidratoG - deficitKcal / 4);
  }

  return {
    carboidratoG: Math.round(carboidratoG),
    proteinaG: Math.round(proteinaG),
    gorduraG: Math.round(gorduraG),
  };
}

export function calcularMacros(energia: EnergiaOrientacao, pesoKg: number): MacrosOrientacao {
  const porTipoDia: Record<TipoDia, MacrosDia> = {
    treino_leve: calcularMacrosDoDia(energia.porTipoDia.treino_leve, pesoKg, "treino_leve"),
    treino_longo_ou_intenso: calcularMacrosDoDia(energia.porTipoDia.treino_longo_ou_intenso, pesoKg, "treino_longo_ou_intenso"),
    descanso: calcularMacrosDoDia(energia.porTipoDia.descanso, pesoKg, "descanso"),
  };

  return {
    porTipoDia,
    explicacao:
      "Carboidrato sobe nos dias de treino mais longo (é o combustível principal da corrida), proteína fica estável todo dia (é o que sustenta a recuperação muscular), e a gordura preenche o restante da energia, sem nunca ficar abaixo do piso de segurança.",
  };
}

export function calcularTiming(): TimingOrientacao {
  // Camada 2/3 templada (sem IA, item 20 do PRD é LATER) — texto fixo,
  // sempre exibido com explicação, nunca número isolado.
  return {
    itens: [
      {
        titulo: "Antes de treinos longos (mais de 60 minutos)",
        texto: "Uma refeição rica em carboidrato de 2 a 3 horas antes ajuda a chegar com o estoque cheio, sem pesar durante a corrida.",
      },
      {
        titulo: "Depois de qualquer treino",
        texto: "Uma combinação de carboidrato e proteína até 60 minutos depois acelera a recuperação — não precisa ser nada elaborado.",
      },
      {
        titulo: "Na véspera de um treino longo ou prova",
        texto: "Aumentar um pouco o carboidrato no jantar da véspera ajuda a começar o dia seguinte com mais reserva de energia.",
      },
      {
        titulo: "Durante treinos acima de 90 minutos",
        texto: "Repor carboidrato a cada 45–60 minutos evita a queda de energia no final — géis, frutas secas ou isotônico funcionam.",
      },
    ],
  };
}

// Placeholder: 35ml/kg é a referência genérica mais comum de hidratação
// diária de base; 500–750ml/h de treino é a faixa usual de reposição de
// suor em corrida moderada — usamos o meio da faixa (600ml/h).
const HIDRATACAO_BASE_ML_KG = 35;
const HIDRATACAO_EXTRA_POR_HORA_TREINO_ML = 600;

export function calcularHidratacao(pesoKg: number): HidratacaoOrientacao {
  return {
    baseMlDia: Math.round(pesoKg * HIDRATACAO_BASE_ML_KG),
    extraPorHoraTreinoMl: HIDRATACAO_EXTRA_POR_HORA_TREINO_ML,
    explicacao: "A base cobre um dia comum; em dia de treino, soma um extra por hora treinada — a sede já é um sinal atrasado, não o único que vale seguir.",
  };
}

/**
 * SUPPLEMENT_GATE (RF03-CA3) — ausência de necessidade é o resultado mais
 * comum e é válido: o gate só libera uma recomendação quando o critério é
 * bem conservador. Nenhuma recomendação aqui é de um produto/marca
 * específica — só orientação alimentar/estratégia geral, para não
 * atravessar em terreno de prescrição.
 */
function calcularSuplementacao(frequenciaSemanal: FrequenciaSemanal, volumeAtualKm: number | undefined): SuplementacaoOrientacao {
  const treinaMuito = frequenciaSemanal === "5x_mais" && (volumeAtualKm ?? 0) > 50;

  if (!treinaMuito) {
    return {
      recomendacoes: [],
      explicacao: "Com o que você respondeu, nenhuma suplementação é necessária agora — sua energia e hidratação já cobrem o que o corpo pede. Isso pode mudar se o seu volume de treino mudar.",
    };
  }

  return {
    recomendacoes: [
      {
        nome: "Reposição de eletrólitos em treinos longos",
        motivo: "Seu volume de treino é alto o suficiente para a perda de sódio no suor pesar — uma bebida isotônica ou eletrólito em treinos acima de 90 minutos ajuda a manter o desempenho.",
      },
    ],
    explicacao: "Seu volume de treino atual justifica um único reforço, focado em reposição durante o esforço — não é uma lista de suplementos, é o mínimo que faz diferença real no seu caso.",
  };
}

export interface EntradaCalculoOrientacao {
  biometria: BlocoBiometria;
  objetivo: BlocoObjetivo;
  frequenciaSemanal: FrequenciaSemanal;
  volumeAtualKm: number | undefined;
}

export interface OrientacaoCalculada {
  energia: EnergiaOrientacao;
  macros: MacrosOrientacao;
  timing: TimingOrientacao;
  hidratacao: HidratacaoOrientacao;
  suplementacao: SuplementacaoOrientacao;
}

/** M04→M05→M06→M07→M08, em sequência determinística (RF03-CA2). Só é
 * chamada depois de calcularTriagem() ter retornado nivel "n3" — nunca
 * roda sozinha (RF02-CA1). */
export function calcularOrientacao(entrada: EntradaCalculoOrientacao): OrientacaoCalculada {
  const energia = calcularEnergia(entrada.biometria, entrada.objetivo, entrada.frequenciaSemanal);
  const macros = calcularMacros(energia, entrada.biometria.pesoKg);
  const timing = calcularTiming();
  const hidratacao = calcularHidratacao(entrada.biometria.pesoKg);
  const suplementacao = calcularSuplementacao(entrada.frequenciaSemanal, entrada.volumeAtualKm);

  return { energia, macros, timing, hidratacao, suplementacao };
}

// ---------------------------------------------------------------------------
// RF06 — Recálculo automático com limites de segurança embutidos
// ---------------------------------------------------------------------------

export const RECALCULO_LIMITE_KCAL = 200; // ±100–200 kcal/ciclo (regra §6 do PRD) — usa o teto da faixa
export const RECALCULO_JANELA_MINIMA_DIAS = 14; // 2–4 semanas — usa o piso da faixa

/**
 * Aplica o teto de variação por ciclo à energia recém-calculada, ancorando
 * na versão anterior — nunca deixa o novo cálculo "saltar" mais que o
 * limite, mesmo que a fórmula bruta sugira uma diferença maior. Vale tanto
 * para o primeiro recálculo quanto para todo recálculo seguinte (regra §6).
 */
export function limitarVariacaoEnergia(anterior: EnergiaOrientacao, novo: EnergiaOrientacao): EnergiaOrientacao {
  function clip(tipo: TipoDia): number {
    const alvo = novo.porTipoDia[tipo];
    const base = anterior.porTipoDia[tipo];
    const min = base - RECALCULO_LIMITE_KCAL;
    const max = base + RECALCULO_LIMITE_KCAL;
    return Math.round(Math.min(max, Math.max(min, alvo)));
  }

  return {
    porTipoDia: {
      treino_leve: clip("treino_leve"),
      treino_longo_ou_intenso: clip("treino_longo_ou_intenso"),
      descanso: clip("descanso"),
    },
    explicacao: novo.explicacao,
  };
}

// ---------------------------------------------------------------------------
// M09 — Guia de alimentação ao redor do treino (RF05)
// ---------------------------------------------------------------------------
// Mora em lib/nutricao/guia-treino.ts, não aqui — ver o comentário no topo
// daquele arquivo: precisa ser importável por um Client Component
// (components/nutricao/GuiaAlimentacaoTreino.tsx), e este módulo carrega
// import "server-only" (abaixo) porque M03–M08 nunca podem ser bundlados
// pro client.

// ---------------------------------------------------------------------------
// M10 — Monitoramento e classificação de status (RF08)
// ---------------------------------------------------------------------------

export interface EntradaStatusNutricional {
  fomeMedia: number | null; // 0-10, média dos check-ins recentes
  energiaMedia: number | null; // 0-10
  giMedia: number | null; // 0-10
  proporcaoAdesaoDificil: number | null; // 0-1
  temRegistroAlimentarRecente: boolean;
}

export interface StatusNutricionalResultado {
  nivel: "verde" | "amarelo" | "vermelho";
  frase: string;
  sinais: string[];
}

/**
 * RF08-CA1: nunca decide por variável isolada — combina sinais (mesma
 * filosofia de calcularBandaCargaForma em lib/painel/calculo.ts, já
 * validada duas vezes no projeto). 0 sinais = verde, 1 = amarelo, 2+ =
 * vermelho.
 *
 * `temRegistroAlimentarRecente` chega como entrada mas nunca vira sinal
 * negativo por si só: regra §6 do PRD proíbe expor adesão baixa como
 * "número isolado de faltas", e registro alimentar nunca é obrigatório
 * (RF07-CA2) — puni-lo aqui contradiria as duas regras ao mesmo tempo. Ele
 * fica disponível pro chamador (ex.: pra decidir se vale pedir um check-in),
 * não pra rebaixar o status sozinho.
 */
export function calcularStatusNutricional(entrada: EntradaStatusNutricional): StatusNutricionalResultado {
  const sinais: string[] = [];

  if (entrada.fomeMedia !== null && entrada.fomeMedia >= 8) sinais.push("fome_alta_persistente");
  if (entrada.energiaMedia !== null && entrada.energiaMedia <= 3) sinais.push("energia_baixa_persistente");
  if (entrada.giMedia !== null && entrada.giMedia >= 6) sinais.push("desconforto_gi_persistente");
  if (entrada.proporcaoAdesaoDificil !== null && entrada.proporcaoAdesaoDificil >= 0.5) sinais.push("adesao_dificil");

  const nivel: StatusNutricionalResultado["nivel"] = sinais.length >= 2 ? "vermelho" : sinais.length === 1 ? "amarelo" : "verde";

  const frase =
    nivel === "verde"
      ? "Seus check-ins recentes não mostram nenhum sinal de atenção — sua orientação segue funcionando como está."
      : nivel === "amarelo"
        ? "Um dos seus sinais recentes pede atenção — sua orientação continua valendo, mas vale observar como você se sente nos próximos dias."
        : "Mais de um sinal recente pede um olhar mais de perto — seu caso já está com a equipe pra revisar sua orientação, não é motivo de alarme.";

  return { nivel, frase, sinais };
}
