import { createClient } from "@/lib/supabase/server";
import type { Papel, Persona, Sessao } from "@/lib/types";

export async function getSessao(): Promise<Sessao | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const papel = user.app_metadata?.papel as Papel | undefined;
  if (!papel) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("nome, persona")
    .eq("id", user.id)
    .single();

  return {
    nome: perfil?.nome ?? user.email ?? "Você",
    papel,
    persona: (perfil?.persona as Persona | null) ?? null,
  };
}
