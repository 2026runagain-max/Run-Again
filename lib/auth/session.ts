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

  // Item 14 (feedback da Marina) — foto_url é coluna nova
  // (supabase/migrations/0011_perfil_corredor.sql), que pode ainda não ter
  // sido aplicada no banco (mesma situação já documentada pra migration
  // 0007). Consulta separada e best-effort, de propósito: se vier numa
  // query só com nome/persona e a coluna não existir, o erro derruba a
  // linha inteira e zera persona também — o que quebraria TODO layout
  // logado (persona nula redireciona pra /corredor/comecar), não só a
  // foto. Aqui, na pior hipótese, fotoUrl fica null e o Avatar volta pras
  // iniciais, exatamente como era antes deste recurso existir.
  const { data: fotoRow, error: fotoError } = await supabase
    .from("usuarios")
    .select("foto_url")
    .eq("id", user.id)
    .single();
  const fotoUrl = !fotoError ? ((fotoRow?.foto_url as string | null) ?? null) : null;

  return {
    nome: perfil?.nome ?? user.email ?? "Você",
    papel,
    persona: (perfil?.persona as Persona | null) ?? null,
    fotoUrl,
  };
}
