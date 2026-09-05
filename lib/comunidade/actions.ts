"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  criarTopicoSchema,
  publicarEvidenciaSchema,
  reportarConteudoSchema,
  responderTopicoSchema,
} from "@/lib/validation/comunidade";
import { comunidadeCopy } from "./copy";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO = comunidadeCopy.erroGenerico;

// Toda página deste fluxo pode ter mudado (feed, conversa, e os 2 lugares
// que hospedam o convite de compartilhar — painel e evolução) — revalidar
// os 3 de uma vez é mais barato do que rastrear qual ação afeta qual tela.
function revalidarTelasDaComunidade() {
  revalidatePath("/corredor/comunidade");
  revalidatePath("/corredor/painel");
  revalidatePath("/corredor/minha-recuperacao/evolucao");
}

async function exigirCorredor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.papel !== "corredor") {
    throw new Error("Não autorizado.");
  }

  const { data: perfil } = await supabase.from("usuarios").select("nome").eq("id", user.id).single();
  return { supabase, userId: user.id, nome: perfil?.nome ?? "Corredor" };
}

export async function marcarOnboardingComunidadeVistoAction(): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase
      .from("usuarios")
      .update({ corredor_viu_onboarding_comunidade: true })
      .eq("id", userId);

    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/comunidade");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF01/RF02 — compartilhar evidência (chamada pelo botão inline no painel e
// na tela de evolução, não por um <form> — por isso recebe os campos já
// resolvidos em vez de FormData).
// ---------------------------------------------------------------------------

export async function publicarEvidenciaComunidadeAction(input: {
  tipoEvidencia: string;
  chave: string;
  textoEvidencia: string;
  legenda?: string;
}): Promise<Resultado<{ postId: string }>> {
  const parsed = publicarEvidenciaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };

  try {
    const { supabase, userId, nome } = await exigirCorredor();
    const { tipoEvidencia, chave, textoEvidencia, legenda } = parsed.data;

    // RF02.1 — texto principal é sempre a frase já gerada pelo painel,
    // copiada literalmente (CA1); origem_pilar é 'fisioterapia' porque as 4
    // evidências elegíveis desta versão vêm todas do painel geral/
    // Fisioterapia (ver nota (a) de 0008_comunidade.sql).
    const { data: post, error: erroPost } = await supabase
      .from("comunidade_posts")
      .insert({
        autor_id: userId,
        autor_nome: nome,
        tipo: "evidencia",
        origem_pilar: "fisioterapia",
        tipo_evidencia: tipoEvidencia,
        texto_evidencia: textoEvidencia,
        legenda: legenda ?? null,
      })
      .select("id")
      .single();

    if (erroPost || !post) return { ok: false, erro: ERRO_GENERICO };

    // RF02-CA2 — marca a evidência de origem como compartilhada, pra o
    // convite (RF01) não reaparecer pro mesmo valor.
    const { error: erroFlag } = await supabase.from("comunidade_evidencias_compartilhadas").upsert(
      {
        usuario_id: userId,
        tipo_evidencia: tipoEvidencia,
        chave,
        post_id: post.id,
        compartilhado_em: new Date().toISOString(),
      },
      { onConflict: "usuario_id,tipo_evidencia" },
    );

    if (erroFlag) return { ok: false, erro: ERRO_GENERICO };

    revalidarTelasDaComunidade();
    return { ok: true, data: { postId: post.id } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF06/RF07 — espaço de conversa
// ---------------------------------------------------------------------------

export async function criarTopicoComunidadeAction(
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado<{ postId: string }>> {
  const parsed = criarTopicoSchema.safeParse({
    titulo: formData.get("titulo"),
    corpo: formData.get("corpo"),
  });
  if (!parsed.success) return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };

  try {
    const { supabase, userId, nome } = await exigirCorredor();
    const { data: post, error } = await supabase
      .from("comunidade_posts")
      .insert({
        autor_id: userId,
        autor_nome: nome,
        tipo: "conversa",
        titulo: parsed.data.titulo,
        corpo: parsed.data.corpo,
      })
      .select("id")
      .single();

    if (error || !post) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/comunidade");
    return { ok: true, data: { postId: post.id } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function responderTopicoComunidadeAction(
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado> {
  const parsed = responderTopicoSchema.safeParse({
    topicoId: formData.get("topicoId"),
    corpo: formData.get("corpo"),
  });
  if (!parsed.success) return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };

  try {
    const { supabase, userId, nome } = await exigirCorredor();
    const { error } = await supabase.from("comunidade_respostas").insert({
      topico_id: parsed.data.topicoId,
      autor_id: userId,
      autor_nome: nome,
      corpo: parsed.data.corpo,
    });

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/comunidade");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF04 — reação única de apoio (toggle)
// ---------------------------------------------------------------------------

export async function reagirComunidadeAction(postId: string, proximoValor: boolean): Promise<Resultado> {
  try {
    const { supabase, userId } = await exigirCorredor();

    const { error } = proximoValor
      ? await supabase.from("comunidade_reacoes").insert({ post_id: postId, usuario_id: userId })
      : await supabase.from("comunidade_reacoes").delete().eq("post_id", postId).eq("usuario_id", userId);

    // RF04-CA1: tocar de novo no mesmo post é o próprio toggle, não um
    // erro — um insert que já existe (23505, unique post_id+usuario_id)
    // trata como sucesso silencioso.
    if (error && error.code !== "23505") return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/comunidade");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF05 — excluir o próprio conteúdo (soft delete via função definer)
// ---------------------------------------------------------------------------

export async function excluirPostComunidadeAction(postId: string): Promise<Resultado> {
  try {
    const { supabase } = await exigirCorredor();
    const { error } = await supabase.rpc("excluir_post_comunidade", { p_post_id: postId });
    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/comunidade");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function excluirRespostaComunidadeAction(respostaId: string): Promise<Resultado> {
  try {
    const { supabase } = await exigirCorredor();
    const { error } = await supabase.rpc("excluir_resposta_comunidade", { p_resposta_id: respostaId });
    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/comunidade");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// ---------------------------------------------------------------------------
// RF08 — reportar (escopo mínimo: grava, sem fila/painel dedicado)
// ---------------------------------------------------------------------------

export async function reportarConteudoComunidadeAction(input: {
  postId?: string;
  respostaId?: string;
  motivo?: string;
}): Promise<Resultado> {
  const parsed = reportarConteudoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };

  try {
    const { supabase, userId } = await exigirCorredor();
    const { error } = await supabase.from("comunidade_denuncias").insert({
      post_id: parsed.data.postId ?? null,
      resposta_id: parsed.data.respostaId ?? null,
      denunciante_id: userId,
      motivo: parsed.data.motivo ?? null,
    });

    if (error) return { ok: false, erro: ERRO_GENERICO };
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
