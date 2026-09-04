"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formDataParaObjeto } from "@/lib/avaliacao/form-utils";
import {
  BLOCO_SCHEMAS_NUTRICAO,
  checkinNutricaoSchema,
  registroAlimentarSchema,
} from "@/lib/validation/nutricao";
import {
  calcularMacros,
  calcularOrientacao,
  calcularStatusNutricional,
  calcularTriagem,
  limitarVariacaoEnergia,
  MOTOR_VERSAO,
  RECALCULO_JANELA_MINIMA_DIAS,
  type EntradaTriagem,
} from "./motor";
import { notificarCorredorOrientacaoPronta, notificarEquipeSobreAlertaSeguranca } from "./email";
import {
  corredorTemCasoAberto,
  getAvaliacaoNutricionalAtual,
  getCheckinsRecentes,
  getContagemRegistrosRecentes,
  getDadosTreinoFluxo2,
  getOrientacaoVigente,
  getProximaVersaoOrientacao,
  primeiroBlocoIncompletoNutricao,
} from "./queries";
import type { ChaveBlocoNutricao } from "./types";
import { calcularBandaCargaForma } from "@/lib/painel/calculo";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO =
  "Não conseguimos salvar essa parte agora. O que você respondeu continua na tela — não foi perdido. Tenta de novo em instantes.";

async function exigirCorredor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.papel !== "corredor") {
    throw new Error("Não autorizado.");
  }
  return { supabase, userId: user.id, email: user.email ?? "", nome: (user.user_metadata?.nome as string) ?? "" };
}

// ---------------------------------------------------------------------------
// RF01 — Onboarding e autosave de bloco (M02)
// ---------------------------------------------------------------------------

export async function marcarOnboardingNutricaoVistoAction(): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase.from("usuarios").update({ corredor_viu_onboarding_nutricao: true }).eq("id", userId);
    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/nutricao");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function salvarBlocoNutricaoAction(
  chave: ChaveBlocoNutricao,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const schema = BLOCO_SCHEMAS_NUTRICAO[chave];
  const bruto = formDataParaObjeto(formData);
  const parsed = schema.safeParse(bruto);

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase } = await exigirCorredor();
    const { error } = await supabase.rpc("salvar_bloco_avaliacao_nutricao", {
      p_chave: chave,
      p_valor: parsed.data,
    });
    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/nutricao/avaliacao");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF02/RF03 — Concluir avaliação: triagem (M03) e, se N3, cálculo (M04–M08)
// ---------------------------------------------------------------------------

export async function concluirAvaliacaoNutricionalAction(): Promise<Resultado<{ nivel: "n2" | "n3" | "n4" }>> {
  try {
    const { supabase, userId, email, nome } = await exigirCorredor();

    const avaliacao = await getAvaliacaoNutricionalAtual(userId);
    if (!avaliacao || primeiroBlocoIncompletoNutricao(avaliacao) !== null) {
      return { ok: false, erro: "Ainda faltam blocos da avaliação. Volta e completa antes de ver sua orientação." };
    }

    const { respostas } = avaliacao;
    const entradaTriagem: EntradaTriagem = {
      biometria: respostas.blocoBiometria!,
      objetivo: respostas.blocoObjetivo!,
      alimentar: respostas.blocoAlimentar!,
      digestivo: respostas.blocoDigestivo!,
      comportamento: respostas.blocoComportamento!,
      saudeMenstrual: respostas.blocoSaudeMenstrual ?? null,
    };

    const triagem = calcularTriagem(entradaTriagem);

    const { error: erroUpdate } = await supabase
      .from("avaliacoes_nutricionais")
      .update({
        concluida_em: avaliacao.concluida_em ?? new Date().toISOString(),
        ultimo_nivel_automacao: triagem.nivel,
        ultima_triagem_flags: triagem.flags.map((f) => f.chave),
        ultima_triagem_em: new Date().toISOString(),
      })
      .eq("usuario_id", userId);

    if (erroUpdate) return { ok: false, erro: "Sua avaliação está toda salva, mas não conseguimos montar sua orientação agora. Tenta de novo — se persistir, a gente já foi avisado." };

    if (triagem.nivel === "n3") {
      const dadosTreino = await getDadosTreinoFluxo2(userId);
      const calculada = calcularOrientacao({
        biometria: entradaTriagem.biometria,
        objetivo: entradaTriagem.objetivo,
        // RF01-CA1: frequência/volume já vêm do Bloco C do Fluxo 2 — nunca
        // perguntados de novo aqui. Fallback conservador só pro caso raro de
        // o corredor ainda não ter esse dado (avaliação de Fluxo 2 antiga).
        frequenciaSemanal: dadosTreino.frequenciaSemanal ?? "1_2x",
        volumeAtualKm: dadosTreino.volumeAtualKm ?? undefined,
      });

      const versao = await getProximaVersaoOrientacao(userId);
      const { error: erroInsert } = await supabase.from("orientacoes_nutricionais").insert({
        usuario_id: userId,
        versao,
        nivel_automacao: "n3",
        origem: "calculada",
        flags_triagem: triagem.flags.map((f) => f.chave),
        energia: calculada.energia,
        macros: calculada.macros,
        timing: calculada.timing,
        hidratacao: calculada.hidratacao,
        suplementacao: calculada.suplementacao,
        motor_versao: MOTOR_VERSAO,
      });

      if (erroInsert) return { ok: false, erro: "Sua avaliação está toda salva, mas não conseguimos montar sua orientação agora. Tenta de novo — se persistir, a gente já foi avisado." };

      // SHOULD (item 14) — melhor esforço, nunca bloqueia o resultado.
      if (email) void notificarCorredorOrientacaoPronta({ emailCorredor: email, nomeCorredor: nome || "corredor" });
    } else if (triagem.nivel === "n4") {
      const jaTemCaso = await corredorTemCasoAberto("seguranca");
      if (!jaTemCaso) {
        const titulos = triagem.flags.map((f) => f.titulo);
        await supabase.from("casos_nutricao").insert({
          usuario_id: userId,
          tipo: "seguranca",
          status: "aberto",
          motivo: titulos.join("; "),
          flags: triagem.flags.map((f) => f.chave),
        });
        // SHOULD (item 17) — melhor esforço, nunca bloqueia RF09 (a fila em
        // si, que é MUST, já foi gravada acima independente do e-mail).
        if (email) void notificarEquipeSobreAlertaSeguranca({ nomeCorredor: nome || "corredor", emailCorredor: email, flagsTitulos: titulos });
      }
    }

    revalidatePath("/corredor/nutricao");
    revalidatePath("/corredor/nutricao/minha-orientacao");
    revalidatePath("/corredor/painel");
    return { ok: true, data: { nivel: triagem.nivel } };
  } catch {
    return { ok: false, erro: "Sua avaliação está toda salva, mas não conseguimos montar sua orientação agora. Tenta de novo — se persistir, a gente já foi avisado." };
  }
}

// ---------------------------------------------------------------------------
// RF06 — Sincronia com volume de treino e recálculo automático
// ---------------------------------------------------------------------------

/**
 * Chamada silenciosamente a partir da tela "Minha orientação" (nenhuma ação
 * do corredor dispara isto — regra §6). Ver nota de arquitetura: o PRD
 * espera o gatilho vindo de uma trilha de treino do Fluxo 3 ("Preparo
 * físico"), que não existe neste codebase. Como stand-in funcional, usa a
 * banda de carga/fadiga/forma que a Fisioterapia já calcula (RPE + zona das
 * respostas 24h) como proxy de "sinal de treino mudou de forma relevante" —
 * documentado aqui, não escondido. Troca o proxy pela trilha real assim que
 * ela existir; a lógica de limite (±kcal/janela mínima) já está pronta e não
 * muda.
 */
export async function sincronizarComVolumeDeTreinoAction(userId: string): Promise<void> {
  try {
    const orientacaoVigente = await getOrientacaoVigente(userId);
    if (!orientacaoVigente || orientacaoVigente.nivel_automacao !== "n3" || !orientacaoVigente.energia || !orientacaoVigente.macros) return;

    const diasDesdeUltima = (Date.now() - new Date(orientacaoVigente.criado_em).getTime()) / 86_400_000;
    if (diasDesdeUltima < RECALCULO_JANELA_MINIMA_DIAS) return;

    const supabase = await createClient();
    const { data: respostas } = await supabase
      .from("respostas_24h")
      .select("carga_vida_percebida, esforco_percebido, zona")
      .eq("paciente_id", userId)
      .order("criado_em", { ascending: false })
      .limit(5);

    if (!respostas || respostas.length === 0) return;

    const banda = calcularBandaCargaForma({
      cargaVida: respostas[0]?.carga_vida_percebida ?? null,
      rpeMedio: respostas.reduce((soma, r) => soma + r.esforco_percebido, 0) / respostas.length,
      zonasAmarelaOuVermelha: respostas.filter((r) => r.zona !== "verde").length,
    });

    if (banda !== "sobrecarga") return;

    const avaliacao = await getAvaliacaoNutricionalAtual(userId);
    const pesoKg = avaliacao?.respostas.blocoBiometria?.pesoKg;
    if (!pesoKg) return;

    const ajusteKcal = 150;
    const energiaProposta = {
      porTipoDia: {
        treino_leve: orientacaoVigente.energia.porTipoDia.treino_leve + ajusteKcal,
        treino_longo_ou_intenso: orientacaoVigente.energia.porTipoDia.treino_longo_ou_intenso + ajusteKcal,
        descanso: orientacaoVigente.energia.porTipoDia.descanso,
      },
      explicacao: "Seu sinal de carga/fadiga recente indicou sobrecarga sustentada — a energia dos seus dias de treino subiu um pouco pra sustentar isso, dentro do limite seguro de ajuste automático.",
    };
    const energiaLimitada = limitarVariacaoEnergia(orientacaoVigente.energia, energiaProposta);
    const macros = calcularMacros(energiaLimitada, pesoKg);
    const versao = await getProximaVersaoOrientacao(userId);

    await supabase.from("orientacoes_nutricionais").insert({
      usuario_id: userId,
      versao,
      nivel_automacao: "n3",
      origem: "calculada",
      flags_triagem: orientacaoVigente.flags_triagem,
      energia: energiaLimitada,
      macros,
      timing: orientacaoVigente.timing,
      hidratacao: orientacaoVigente.hidratacao,
      suplementacao: orientacaoVigente.suplementacao,
      motor_versao: MOTOR_VERSAO,
    });

    revalidatePath("/corredor/nutricao/minha-orientacao");
  } catch {
    // Recalculo silencioso — falha aqui nunca deve quebrar a renderização da
    // tela; a orientação anterior continua válida e visível.
  }
}

// ---------------------------------------------------------------------------
// RF07 — Registro alimentar
// ---------------------------------------------------------------------------

export async function registrarAlimentoAction(_prevState: unknown, formData: FormData): Promise<Resultado> {
  const parsed = registroAlimentarSchema.safeParse({
    fonte: formData.get("fonte"),
    nomeAlimento: formData.get("nomeAlimento"),
    marca: formData.get("marca") || undefined,
    porcaoDescricao: formData.get("porcaoDescricao") || undefined,
    refeicao: formData.get("refeicao"),
    offCodigo: formData.get("offCodigo") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase.from("registros_alimentares").insert({
      usuario_id: userId,
      fonte: parsed.data.fonte,
      nome_alimento: parsed.data.nomeAlimento,
      marca: parsed.data.marca ?? null,
      porcao_descricao: parsed.data.porcaoDescricao ?? null,
      refeicao: parsed.data.refeicao,
      off_codigo: parsed.data.offCodigo ?? null,
    });
    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/nutricao/registro");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function removerRegistroAlimentarAction(registroId: string): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase.from("registros_alimentares").delete().eq("id", registroId).eq("usuario_id", userId);
    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/nutricao/registro");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF08 — Check-in de monitoramento (M10) e fila de revisão automática
// ---------------------------------------------------------------------------

export async function registrarCheckinNutricaoAction(_prevState: unknown, formData: FormData): Promise<Resultado> {
  const parsed = checkinNutricaoSchema.safeParse({
    fomeNivel: formData.get("fomeNivel"),
    energiaNivel: formData.get("energiaNivel"),
    desconfortoGi: formData.get("desconfortoGi"),
    adesaoPercebida: formData.get("adesaoPercebida"),
    observacao: formData.get("observacao") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase.from("checkins_nutricao").insert({
      usuario_id: userId,
      fome_nivel: parsed.data.fomeNivel,
      energia_nivel: parsed.data.energiaNivel,
      desconforto_gi: parsed.data.desconfortoGi,
      adesao_percebida: parsed.data.adesaoPercebida,
      observacao: parsed.data.observacao ?? null,
    });
    if (error) return { ok: false, erro: ERRO_GENERICO };

    await avaliarStatusEAbrirRevisaoSeNecessario(userId);

    revalidatePath("/corredor/nutricao");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/** RF08-CA2 — amarelo/vermelho insere o caso na fila de revisão automaticamente. */
async function avaliarStatusEAbrirRevisaoSeNecessario(userId: string) {
  const [checkins, registros7d, orientacaoVigente, jaTemCaso] = await Promise.all([
    getCheckinsRecentes(userId, 5),
    getContagemRegistrosRecentes(userId, new Date(Date.now() - 7 * 86_400_000)),
    getOrientacaoVigente(userId),
    corredorTemCasoAberto("revisao"),
  ]);

  if (checkins.length === 0 || jaTemCaso || !orientacaoVigente) return;

  const media = (campo: "fome_nivel" | "energia_nivel" | "desconforto_gi") =>
    checkins.reduce((soma, c) => soma + c[campo], 0) / checkins.length;
  const proporcaoDificil = checkins.filter((c) => c.adesao_percebida === "dificil_seguir").length / checkins.length;

  const status = calcularStatusNutricional({
    fomeMedia: media("fome_nivel"),
    energiaMedia: media("energia_nivel"),
    giMedia: media("desconforto_gi"),
    proporcaoAdesaoDificil: proporcaoDificil,
    temRegistroAlimentarRecente: registros7d > 0,
  });

  if (status.nivel === "verde") return;

  const supabase = await createClient();
  await supabase.from("casos_nutricao").insert({
    usuario_id: userId,
    tipo: "revisao",
    status: "aberto",
    motivo: `Status ${status.nivel} nos check-ins recentes.`,
    flags: status.sinais,
    orientacao_id: orientacaoVigente.id,
  });
}

/** RF10-CA1 — pedido explícito do corredor, mesma fila que o gatilho automático. */
export async function pedirRevisaoNutricionalAction(): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();
    const [orientacaoVigente, jaTemCaso] = await Promise.all([
      getOrientacaoVigente(userId),
      corredorTemCasoAberto("revisao"),
    ]);

    if (jaTemCaso) return { ok: true }; // já existe um pedido em aberto — idempotente

    const { error } = await supabase.from("casos_nutricao").insert({
      usuario_id: userId,
      tipo: "revisao",
      status: "aberto",
      motivo: "Pedido explícito do corredor.",
      flags: [],
      orientacao_id: orientacaoVigente?.id ?? null,
    });
    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/nutricao/minha-orientacao");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
