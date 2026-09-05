"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { editarPerfilSchema, TAMANHO_MAXIMO_FOTO_PERFIL, TIPOS_FOTO_PERFIL_ACEITOS } from "@/lib/validation/perfil";

type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; erro: string };

const ERRO_GENERICO = "Não deu pra salvar agora — tenta de novo.";

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------------------------------------------------------------------------
// Item 14 (feedback da Marina) — edição de informações básicas do perfil.
// ---------------------------------------------------------------------------

export async function editarPerfilAction(_prevState: unknown, formData: FormData): Promise<Resultado> {
  const parsed = editarPerfilSchema.safeParse({
    nome: formData.get("nome"),
    instagram: formData.get("instagram"),
    strava: formData.get("strava"),
  });
  if (!parsed.success) return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: "Sessão expirou — entra de novo." };

    const { error } = await supabase
      .from("usuarios")
      .update({
        nome: parsed.data.nome,
        instagram: parsed.data.instagram ?? null,
        strava: parsed.data.strava ?? null,
      })
      .eq("id", user.id);

    if (error) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/perfil");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// Upload de foto de perfil — bucket "avatars" (público pra leitura, escrita
// só do próprio dono; ver 0011_perfil_corredor.sql). Caminho do arquivo é
// sempre "<uid>/foto" (sem nome original) pra nunca acumular lixo: cada
// envio novo sobrescreve o anterior no Storage (upsert) e troca só a
// query string (`?v=timestamp`) salva em usuarios.foto_url pra invalidar
// cache de imagem no navegador.
export async function enviarFotoPerfilAction(
  _prevState: unknown,
  formData: FormData,
): Promise<Resultado<{ fotoUrl: string }>> {
  const arquivo = formData.get("foto");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Escolhe uma imagem primeiro." };
  }
  if (!TIPOS_FOTO_PERFIL_ACEITOS.includes(arquivo.type as (typeof TIPOS_FOTO_PERFIL_ACEITOS)[number])) {
    return { ok: false, erro: "Formato não aceito — use JPG, PNG ou WEBP." };
  }
  if (arquivo.size > TAMANHO_MAXIMO_FOTO_PERFIL) {
    return { ok: false, erro: "Essa imagem passou de 5MB — tenta uma menor." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: "Sessão expirou — entra de novo." };

    const extensao = arquivo.type === "image/png" ? "png" : arquivo.type === "image/webp" ? "webp" : "jpg";
    const caminho = `${user.id}/foto.${extensao}`;

    const { error: erroUpload } = await supabase.storage.from("avatars").upload(caminho, arquivo, {
      upsert: true,
      contentType: arquivo.type,
    });
    if (erroUpload) return { ok: false, erro: ERRO_GENERICO };

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(caminho);
    const fotoUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: erroUpdate } = await supabase.from("usuarios").update({ foto_url: fotoUrl }).eq("id", user.id);
    if (erroUpdate) return { ok: false, erro: ERRO_GENERICO };

    revalidatePath("/corredor/perfil");
    return { ok: true, data: { fotoUrl } };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
