"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { atendimentoPsicologiaSchema } from "@/lib/validation/psicologia";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO =
  "Não foi possível salvar agora. O que você digitou continua no formulário — nada foi perdido. Tenta salvar de novo.";

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

// RF-5 — mesma máquina de estados de atendimento do Fluxo 1 (RF-A),
// especialidade psicologia sobre a mesma espinha genérica (0007_
// psicologia_esportiva.sql, atendimentos.especialidade).
export async function iniciarAtendimentoPsicologiaAction(
  pacienteId: string,
): Promise<Resultado<{ atendimentoId: string }>> {
  try {
    const { supabase, userId } = await exigirProfissional();

    const { data: aberto } = await supabase
      .from("atendimentos")
      .select("id")
      .eq("paciente_id", pacienteId)
      .eq("especialidade", "psicologia_esporte")
      .eq("status", "em_andamento")
      .maybeSingle();

    if (aberto) {
      return { ok: true, data: { atendimentoId: aberto.id } };
    }

    const { data, error } = await supabase
      .from("atendimentos")
      .insert({ paciente_id: pacienteId, profissional_id: userId, especialidade: "psicologia_esporte" })
      .select("id")
      .single();

    if (error || !data) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/psicologia`);
    return { ok: true, data: { atendimentoId: data.id } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// Reaproveita as mesmas 3 colunas de texto livre do atendimento genérico
// (queixa_principal/historico_subjetivo/observacoes_objetivas), com sentido
// próprio da especialidade psicologia (relato / evolução e decisão / plano
// — §2.2 do PRD) em vez do sentido clínico de fisioterapia.
export async function salvarAtendimentoPsicologiaAction(
  atendimentoId: string,
  pacienteId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = atendimentoPsicologiaSchema.safeParse({
    relato: formData.get("relato") ?? "",
    evolucaoDecisao: formData.get("evolucaoDecisao") ?? "",
    plano: formData.get("plano") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("atendimentos")
      .update({
        queixa_principal: parsed.data.relato,
        historico_subjetivo: parsed.data.evolucaoDecisao || null,
        observacoes_objetivas: parsed.data.plano || null,
      })
      .eq("id", atendimentoId)
      .eq("especialidade", "psicologia_esporte");

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/psicologia/atendimento`);
    revalidatePath(`/profissional/pacientes/${pacienteId}/psicologia`);
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function finalizarAtendimentoPsicologiaAction(
  atendimentoId: string,
  pacienteId: string,
): Promise<Resultado> {
  try {
    const { supabase } = await exigirProfissional();
    const { error } = await supabase
      .from("atendimentos")
      .update({ status: "finalizado", finalizado_em: new Date().toISOString() })
      .eq("id", atendimentoId)
      .eq("especialidade", "psicologia_esporte")
      .eq("status", "em_andamento");

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath(`/profissional/pacientes/${pacienteId}/psicologia`);
    revalidatePath("/profissional/psicologia/fila");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
