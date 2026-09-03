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

  return { ...perfil, email: user.email ?? "" };
}
