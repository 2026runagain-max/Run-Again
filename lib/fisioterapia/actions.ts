"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { avaliacaoSchema, exercicioDoseSchema, testeSchema } from "@/lib/validation/fisioterapia";
import { estagioPorScore } from "./labels";
import type { CapacidadeRadar } from "./types";

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

// ---------------------------------------------------------------------------
// Atendimento (RF-A)
// ---------------------------------------------------------------------------

export async function iniciarAtendimentoAction(
  pacienteId: string,
): Promise<Resultado<{ atendimentoId: string }>> {
  try {
    const { supabase, userId } = await exigirProfissional();

    const { data: aberto } = await supabase
      .from("atendimentos")
      .select("id")
      .eq("paciente_id", pacienteId)
      .eq("especialidade", "fisioterapia")
      .eq("status", "em_andamento")
      .maybeSingle();

    if (aberto) {
      return { ok: true, data: { atendimentoId: aberto.id } };
    }

    const { data, error } = await supabase
      .from("atendimentos")
      .insert({ paciente_id: pacienteId, profissional_id: userId, especialidade: "fisioterapia" })
      .select("id")
      .single();

    if (error || !data) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}`);
    return { ok: true, data: { atendimentoId: data.id } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function salvarAvaliacaoAction(
  atendimentoId: string,
  pacienteId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = avaliacaoSchema.safeParse({
    condicaoPrincipal: formData.get("condicaoPrincipal") || undefined,
    queixaPrincipal: formData.get("queixaPrincipal") ?? "",
    historicoSubjetivo: formData.get("historicoSubjetivo") ?? "",
    observacoesObjetivas: formData.get("observacoesObjetivas") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("atendimentos")
      .update({
        condicao_principal: parsed.data.condicaoPrincipal ?? null,
        queixa_principal: parsed.data.queixaPrincipal,
        historico_subjetivo: parsed.data.historicoSubjetivo || null,
        observacoes_objetivas: parsed.data.observacoesObjetivas || null,
      })
      .eq("id", atendimentoId);

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/atendimento`);
    revalidatePath(`/profissional/pacientes/${pacienteId}`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function finalizarAtendimentoAction(
  atendimentoId: string,
  pacienteId: string,
): Promise<Resultado> {
  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("atendimentos")
      .update({ status: "finalizado", finalizado_em: new Date().toISOString() })
      .eq("id", atendimentoId)
      .eq("especialidade", "fisioterapia")
      .eq("status", "em_andamento");

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}`);
    revalidatePath("/profissional/pacientes");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// Performance / testes (RF-C)
// ---------------------------------------------------------------------------

export async function registrarTesteAction(
  pacienteId: string,
  atendimentoId: string | null,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = testeSchema.safeParse({
    capacidade: formData.get("capacidade"),
    nome: formData.get("nome"),
    unidade: formData.get("unidade"),
    lado: formData.get("lado"),
    valor: formData.get("valor"),
    metaClinica: formData.get("metaClinica"),
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirProfissional();
    const { error } = await supabase.from("performance_testes").insert({
      paciente_id: pacienteId,
      atendimento_id: atendimentoId,
      capacidade: parsed.data.capacidade,
      nome: parsed.data.nome,
      unidade: parsed.data.unidade,
      lado: parsed.data.lado,
      valor: parsed.data.valor,
      meta_clinica: parsed.data.metaClinica,
      criado_por: userId,
    });

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/performance`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// Sessão prescrita (RF-B/E/F)
// ---------------------------------------------------------------------------

const DOSE_PADRAO: Record<
  CapacidadeRadar,
  { series: number; repeticoes: number; cargaOuTempo: string }
> = {
  forca: { series: 3, repeticoes: 12, cargaOuTempo: "conforme tolerado" },
  potencia: { series: 4, repeticoes: 8, cargaOuTempo: "explosivo" },
  resistencia_muscular: { series: 3, repeticoes: 20, cargaOuTempo: "até leve fadiga" },
  mobilidade: { series: 3, repeticoes: 10, cargaOuTempo: "30s por lado" },
  estabilidade: { series: 3, repeticoes: 10, cargaOuTempo: "30s" },
  equilibrio: { series: 3, repeticoes: 1, cargaOuTempo: "30s por lado" },
  capacidade_aerobia: { series: 1, repeticoes: 1, cargaOuTempo: "15-20 min" },
  controle_motor: { series: 3, repeticoes: 10, cargaOuTempo: "ritmo controlado" },
  amplitude_movimento: { series: 3, repeticoes: 12, cargaOuTempo: "amplitude confortável" },
};

export async function criarSessaoManualAction(
  pacienteId: string,
  atendimentoId: string,
): Promise<Resultado<{ sessaoId: string }>> {
  try {
    const { supabase, userId } = await exigirProfissional();
    const { data, error } = await supabase
      .from("sessoes_prescritas")
      .insert({ atendimento_id: atendimentoId, paciente_id: pacienteId, profissional_id: userId })
      .select("id")
      .single();

    if (error || !data) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/sessao`);
    return { ok: true, data: { sessaoId: data.id } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * RF-E (versão de beta) — correspondência estruturada simples: capacidade com
 * menor score no radar (o déficit atual) + estágio derivado do score +
 * condição principal do atendimento, quando existir. Não é o motor de ranking
 * completo via tags (item 13, LATER) — é o corte mínimo que o beta comporta.
 */
export async function criarSessaoComFocoAtualAction(
  pacienteId: string,
  atendimentoId: string,
): Promise<Resultado<{ sessaoId: string }>> {
  try {
    const { supabase, userId } = await exigirProfissional();

    const { data: radar } = await supabase
      .from("vw_radar_capacidades")
      .select("capacidade, score")
      .eq("paciente_id", pacienteId);

    if (!radar || radar.length === 0) {
      return {
        ok: false,
        erro: "Ainda não há teste de performance registrado para calcular um foco. Registra pelo menos um teste primeiro.",
      };
    }

    const deficit = radar.reduce((menor, atual) => (atual.score < menor.score ? atual : menor));
    const estagioAlvo = estagioPorScore(deficit.score);

    const { data: atendimento } = await supabase
      .from("atendimentos")
      .select("condicao_principal")
      .eq("id", atendimentoId)
      .maybeSingle();

    let query = supabase
      .from("exercicios_catalogo")
      .select("*")
      .eq("capacidade", deficit.capacidade as CapacidadeRadar);

    if (atendimento?.condicao_principal) {
      query = query.or(`condicao.is.null,condicao.eq.${atendimento.condicao_principal}`);
    } else {
      query = query.is("condicao", null);
    }

    const { data: candidatos } = await query;
    if (!candidatos || candidatos.length === 0) {
      return {
        ok: false,
        erro: "Não encontramos exercício no catálogo pra esse foco ainda. Monta a sessão manualmente.",
      };
    }

    const doExercicioMesmoEstagio = candidatos.filter((c) => c.estagio === estagioAlvo);
    const selecionados = (doExercicioMesmoEstagio.length > 0 ? doExercicioMesmoEstagio : candidatos).slice(
      0,
      4,
    );

    const { data: sessao, error: erroSessao } = await supabase
      .from("sessoes_prescritas")
      .insert({
        atendimento_id: atendimentoId,
        paciente_id: pacienteId,
        profissional_id: userId,
        titulo: "Sessão com foco atual",
      })
      .select("id")
      .single();

    if (erroSessao || !sessao) return { ok: false, erro: ERRO_GENERICO };

    const dose = DOSE_PADRAO[deficit.capacidade as CapacidadeRadar];
    const linhas = selecionados.map((exercicio, i) => ({
      sessao_id: sessao.id,
      exercicio_id: exercicio.id,
      series: dose.series,
      repeticoes: dose.repeticoes,
      carga_ou_tempo: dose.cargaOuTempo,
      ordem: i,
    }));

    const { error: erroExercicios } = await supabase.from("sessao_exercicios").insert(linhas);
    if (erroExercicios) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/sessao`);
    return { ok: true, data: { sessaoId: sessao.id } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function adicionarExercicioSessaoAction(
  sessaoId: string,
  pacienteId: string,
  proximaOrdem: number,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = exercicioDoseSchema.safeParse({
    exercicioId: formData.get("exercicioId"),
    series: formData.get("series") || undefined,
    repeticoes: formData.get("repeticoes") || undefined,
    cargaOuTempo: formData.get("cargaOuTempo") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase.from("sessao_exercicios").insert({
      sessao_id: sessaoId,
      exercicio_id: parsed.data.exercicioId,
      series: parsed.data.series ?? null,
      repeticoes: parsed.data.repeticoes ?? null,
      carga_ou_tempo: parsed.data.cargaOuTempo ?? null,
      ordem: proximaOrdem,
    });

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/sessao`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function removerExercicioSessaoAction(
  sessaoExercicioId: string,
  sessaoId: string,
  pacienteId: string,
): Promise<Resultado> {
  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("sessao_exercicios")
      .delete()
      .eq("id", sessaoExercicioId)
      .eq("sessao_id", sessaoId);

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/sessao`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// RF-F: ato de visibilidade é distinto do ato de salvar — nunca automático.
export async function enviarSessaoParaCorredorAction(
  sessaoId: string,
  pacienteId: string,
): Promise<Resultado> {
  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("sessoes_prescritas")
      .update({ visivel_para_corredor: true, enviada_em: new Date().toISOString() })
      .eq("id", sessaoId);

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/sessao`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function ocultarSessaoAction(
  sessaoId: string,
  pacienteId: string,
): Promise<Resultado> {
  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("sessoes_prescritas")
      .update({ visivel_para_corredor: false })
      .eq("id", sessaoId);

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/sessao`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
