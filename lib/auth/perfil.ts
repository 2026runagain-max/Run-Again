import { createClient } from "@/lib/supabase/server";
import type { Especialidade, Papel, Persona } from "@/lib/types";

interface PerfilRow {
  papel: Papel;
  nome: string;
  persona: Persona | null;
  especialidade: Especialidade | null;
  trial_termina_em: string | null;
  criado_em: string;
}

interface CamposPerfilItem14 {
  instagram: string | null;
  strava: string | null;
  foto_url: string | null;
}

export async function getPerfilCompleto() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("papel, nome, persona, especialidade, trial_termina_em, criado_em")
    .eq("id", user.id)
    .single<PerfilRow>();

  if (!perfil) return null;

  // Item 14 (feedback da Marina) — instagram/strava/foto_url são colunas
  // novas (supabase/migrations/0011_perfil_corredor.sql), que podem ainda
  // não ter sido aplicadas no banco (mesma situação já documentada pra
  // migration 0007). Consulta separada e best-effort, de propósito: se
  // viesse na mesma query acima, um erro de "coluna não existe" derrubaria
  // papel/nome/persona também — quebrando a tela de perfil inteira, não só
  // os 3 campos novos.
  const { data: camposNovos, error: camposNovosErro } = await supabase
    .from("usuarios")
    .select("instagram, strava, foto_url")
    .eq("id", user.id)
    .single<CamposPerfilItem14>();
  const { instagram, strava, foto_url } = camposNovosErro
    ? { instagram: null, strava: null, foto_url: null }
    : (camposNovos ?? { instagram: null, strava: null, foto_url: null });

  return { ...perfil, instagram, strava, foto_url, email: user.email ?? "" };
}
