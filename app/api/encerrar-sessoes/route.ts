import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Encerra todas as sessões ativas do usuário atual (RF03-CA4).
 * Precisa da service role key (auth.admin.signOut com escopo 'global'),
 * por isso não pode ser feito direto do client.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Sessão não encontrada." }, { status: 401 });
  }

  const admin = createAdminClient();
  await admin.auth.admin.signOut(user.id, "global");

  await admin.from("audit_log").insert({
    usuario_id: user.id,
    acao: "senha_redefinida",
    entidade: "usuarios",
    entidade_id: user.id,
  });

  return NextResponse.json({ ok: true });
}
