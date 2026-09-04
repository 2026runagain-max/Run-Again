"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ajusteOrientacaoSchema } from "@/lib/validation/nutricao";
import { calcularHidratacao, calcularTiming, MOTOR_VERSAO } from "./motor";
import { getAvaliacaoNutricionalAtual, getProximaVersaoOrientacao } from "./queries";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO = "Não foi possível salvar agora. O que você digitou continua no formulário — nada foi perdido. Tenta salvar de novo.";

async function exigirProfissional() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.papel !== "profissional") {
    throw new Error("Não autorizado.");
  }
  return { supabase, userId: user.id };
}

export async function assumirCasoNutricaoAction(casoId: string): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirProfissional();
    const { error } = await supabase
      .from("casos_nutricao")
      .update({ status: "em_atendimento", atendido_por: userId })
      .eq("id", casoId)
      .eq("status", "aberto");
    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/profissional/nutricao/casos");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function marcarCasoResolvidoAction(casoId: string): Promise<Resultado> {
  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("casos_nutricao")
      .update({ status: "resolvido", resolvido_em: new Date().toISOString() })
      .eq("id", casoId);
    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/profissional/nutricao/casos");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// Compartilhado pelas duas ações abaixo — grava a orientação escrita pela
// equipe e fecha o caso que a originou, num único passo (regra §8:
// "✓ Ajuste salvo. O corredor já vê a orientação atualizada.").
async function gravarOrientacaoDaEquipe(params: {
  casoId: string;
  pacienteId: string;
  origem: "definida_pela_equipe" | "ajustada_pela_equipe";
  profissionalId: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
  formData: FormData;
}): Promise<Resultado> {
  const { casoId, pacienteId, origem, profissionalId, supabase, formData } = params;

  const parsed = ajusteOrientacaoSchema.safeParse({
    energiaTreinoLeveKcal: formData.get("energiaTreinoLeveKcal"),
    energiaTreinoLongoKcal: formData.get("energiaTreinoLongoKcal"),
    energiaDescansoKcal: formData.get("energiaDescansoKcal"),
    carboidratoG: formData.get("carboidratoG"),
    proteinaG: formData.get("proteinaG"),
    gorduraG: formData.get("gorduraG"),
    explicacao: formData.get("explicacao"),
    observacoesInternas: formData.get("observacoesInternas") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  const avaliacao = await getAvaliacaoNutricionalAtual(pacienteId);
  const pesoKg = avaliacao?.respostas.blocoBiometria?.pesoKg;
  const nivelAutomacao = avaliacao?.ultimo_nivel_automacao ?? "n4";

  const macrosPorDia = { carboidratoG: parsed.data.carboidratoG, proteinaG: parsed.data.proteinaG, gorduraG: parsed.data.gorduraG };

  const versao = await getProximaVersaoOrientacao(pacienteId);
  const { data: novaOrientacao, error: erroInsert } = await supabase
    .from("orientacoes_nutricionais")
    .insert({
      usuario_id: pacienteId,
      versao,
      nivel_automacao: nivelAutomacao,
      origem,
      flags_triagem: avaliacao?.ultima_triagem_flags ?? [],
      energia: {
        porTipoDia: {
          treino_leve: parsed.data.energiaTreinoLeveKcal,
          treino_longo_ou_intenso: parsed.data.energiaTreinoLongoKcal,
          descanso: parsed.data.energiaDescansoKcal,
        },
        explicacao: parsed.data.explicacao,
      },
      // Simplificação desta implementação (beta): a equipe define um único
      // conjunto de macros, aplicado aos três tipos de dia — diferente do
      // motor automático (M05), que varia carboidrato por tipo de dia. Uma
      // UI de macro por tipo de dia é possível depois; para o volume de
      // ajustes manuais esperado no beta, um editor por tipo de dia seria
      // desproporcional.
      macros: {
        porTipoDia: { treino_leve: macrosPorDia, treino_longo_ou_intenso: macrosPorDia, descanso: macrosPorDia },
        explicacao: parsed.data.explicacao,
      },
      timing: calcularTiming(),
      hidratacao: pesoKg
        ? calcularHidratacao(pesoKg)
        : { baseMlDia: 2500, extraPorHoraTreinoMl: 600, explicacao: "Estimativa geral — sem peso registrado para calcular sua base exata." },
      suplementacao: { recomendacoes: [], explicacao: "Definida pela equipe a partir da sua avaliação individual — sem suplementação adicional indicada por enquanto." },
      motor_versao: MOTOR_VERSAO,
      ajustado_por: profissionalId,
      ajustado_em: new Date().toISOString(),
      caso_origem_id: casoId,
    })
    .select("id")
    .single();

  if (erroInsert || !novaOrientacao) return { ok: false, erro: ERRO_GENERICO };

  const { error: erroCaso } = await supabase
    .from("casos_nutricao")
    .update({ status: "resolvido", resolvido_em: new Date().toISOString(), orientacao_id: novaOrientacao.id, atendido_por: profissionalId })
    .eq("id", casoId);

  if (erroCaso) return { ok: false, erro: ERRO_GENERICO };

  revalidatePath("/profissional/nutricao/casos");
  revalidatePath(`/profissional/pacientes/${pacienteId}/nutricao`);
  revalidatePath("/corredor/nutricao/minha-orientacao");
  return { ok: true };
}

/** RF09-CA3 — libera orientação para um caso de segurança (N4). Nunca 'calculada'. */
export async function liberarOrientacaoN4Action(
  casoId: string,
  pacienteId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirProfissional();
    return await gravarOrientacaoDaEquipe({ casoId, pacienteId, origem: "definida_pela_equipe", profissionalId: userId, supabase, formData });
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/** RF10-CA3 — ajusta uma orientação N3 já calculada, a partir da fila de revisão. */
export async function ajustarOrientacaoRevisaoAction(
  casoId: string,
  pacienteId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirProfissional();
    return await gravarOrientacaoDaEquipe({ casoId, pacienteId, origem: "ajustada_pela_equipe", profissionalId: userId, supabase, formData });
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
