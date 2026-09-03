import { createClient } from "@/lib/supabase/server";
import type { Papel, Sessao } from "@/lib/types";

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
    .select("nome")
    .eq("id", user.id)
    .single();

  return {
    nome: perfil?.nome ?? user.email ?? "Você",
    papel,
  };
}
