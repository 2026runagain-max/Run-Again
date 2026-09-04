"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  BLOCO_SCHEMAS,
  consentimentoSaudeSchema,
  personaSchema,
} from "@/lib/validation/avaliacao";
import { consentimentoSaude, estados } from "./copy";
import { calcularDiagnostico } from "./diagnostico";
import { getAvaliacaoAtual, primeiroBlocoIncompleto } from "./queries";
import { formDataParaObjeto } from "./form-utils";
import type { ChaveBloco, RespostasAvaliacao } from "./types";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO = estados.erroSalvarBloco.subtitulo;

async function exigirCorredor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.papel !== "corredor") {
    throw new Error("Não autorizado.");
  }
  return { supabase, userId: user.id, email: user.email ?? "" };
}

// ---------------------------------------------------------------------------
// RF01 — Consentimento de dado de saúde
// ---------------------------------------------------------------------------

export async function registrarConsentimentoSaudeAction(
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = consentimentoSaudeSchema.safeParse({
    aceite: formData.get("aceite") === "on",
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase
      .from("usuarios")
      .update({
        consentimento_saude_versao: consentimentoSaude.versao,
        consentimento_saude_em: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) return { ok: false, erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." };

    revalidatePath("/corredor/comecar");
    return { ok: true };
  } catch {
    return { ok: false, erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." };
  }
}

// ---------------------------------------------------------------------------
// RF02 — Persona (Passo 0 / "ponto de partida")
// ---------------------------------------------------------------------------

export async function definirPersonaAction(_prevState: unknown, formData: FormData): Promise<Resultado> {
  const parsed = personaSchema.safeParse({ persona: formData.get("persona") });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase, userId } = await exigirCorredor();

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("consentimento_saude_em")
      .eq("id", userId)
      .single();

    if (!perfil?.consentimento_saude_em) {
      return { ok: false, erro: "Você precisa aceitar o consentimento de dados de saúde antes de continuar." };
    }

    const { error } = await supabase.from("usuarios").update({ persona: parsed.data.persona }).eq("id", userId);
    if (error) return { ok: false, erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." };

    revalidatePath("/corredor/comecar");
    revalidatePath("/corredor/painel");
    return { ok: true };
  } catch {
    return { ok: false, erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." };
  }
}

// ---------------------------------------------------------------------------
// RF03 — Autosave de bloco (A–H)
// ---------------------------------------------------------------------------

export async function salvarBlocoAction(
  chave: ChaveBloco,
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const schema = BLOCO_SCHEMAS[chave];
  const bruto = formDataParaObjeto(formData);
  const parsed = schema.safeParse(bruto);

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  try {
    const { supabase } = await exigirCorredor();

    const { error } = await supabase.rpc("salvar_bloco_avaliacao", {
      p_chave: chave,
      p_valor: parsed.data,
    });

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/comecar");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF04 — Concluir avaliação e gerar diagnóstico
// ---------------------------------------------------------------------------

export async function concluirAvaliacaoAction(): Promise<Resultado<{ diagnostico: true }>> {
  try {
    const { supabase, userId } = await exigirCorredor();

    const [avaliacao, perfil] = await Promise.all([
      getAvaliacaoAtual(userId),
      supabase.from("usuarios").select("persona").eq("id", userId).single(),
    ]);

    if (!avaliacao || primeiroBlocoIncompleto(avaliacao) !== null) {
      // RF04-CA1 — nunca gera diagnóstico parcial.
      return { ok: false, erro: "Ainda faltam blocos da avaliação. Volta e completa antes de ver seu diagnóstico." };
    }

    const persona = perfil.data?.persona ?? null;
    const diagnostico = calcularDiagnostico(avaliacao.respostas as RespostasAvaliacao, persona);

    const { error } = await supabase
      .from("avaliacoes_iniciais")
      .update({
        risco_score: diagnostico.riscoScore,
        frase_identidade: diagnostico.fraseIdentidade,
        banda_risco: diagnostico.bandaRisco,
        banda_risco_frase: diagnostico.bandaRiscoFrase,
        perfil_biomecanico_flags: diagnostico.perfilBiomecanicoFlags,
        perfil_biomecanico_frase: diagnostico.perfilBiomecanicoFrase,
        perfil_psicologico_frase: diagnostico.perfilPsicologicoFrase,
        pontos_atencao: diagnostico.pontosAtencao,
        concluida_em: new Date().toISOString(),
      })
      .eq("usuario_id", userId);

    if (error) {
      return { ok: false, erro: estados.erroCalcularDiagnostico.subtitulo };
    }

    // RF06 (notificação à equipe por e-mail) fica desligada no beta por
    // decisão de produto — não é limitação técnica, o provedor já está
    // implementado em lib/avaliacao/notificar-equipe.ts. Pra reativar:
    // descomentar a chamada abaixo, restaurar reenviarNotificacaoEquipeAction
    // e o botão de reenvio na tela de diagnóstico (removidos nesta decisão,
    // ver histórico do arquivo).
    //
    // const envio = await notificarEquipeSobreDiagnostico({ ... });
    // await supabase.from("avaliacoes_iniciais").update(
    //   envio.ok ? { notificado_equipe_em: new Date().toISOString() } : { notificacao_erro: envio.erro },
    // ).eq("usuario_id", userId);

    revalidatePath("/corredor/comecar");
    revalidatePath("/corredor/diagnostico");
    revalidatePath("/corredor/painel");
    return { ok: true, data: { diagnostico: true } };
  } catch {
    return { ok: false, erro: estados.erroCalcularDiagnostico.subtitulo };
  }
}

// RF06 (notificação à equipe) e seu reenvio manual ficam fora do beta por
// decisão de produto — ver nota em concluirAvaliacaoAction acima. A função
// reenviarNotificacaoEquipeAction existiu aqui e foi removida junto com o
// botão que a chamava (components/avaliacao/ReenviarNotificacaoButton.tsx);
// lib/avaliacao/notificar-equipe.ts continua pronta pra quando isso reativar.
