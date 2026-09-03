import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { TERMOS_VERSAO_ATUAL } from "@/lib/legal";

const bodySchema = z.object({
  token: z.uuid(),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Confere os campos destacados e tenta de novo." },
      { status: 400 },
    );
  }

  const { token, senha } = parsed.data;
  const admin = createAdminClient();

  const { data: convite, error: erroConvite } = await admin.rpc(
    "consumir_convite_profissional",
    { p_token: token },
  );

  if (erroConvite || !convite || !convite.token) {
    return NextResponse.json(
      {
        erro:
          "Esse convite expirou ou já foi usado. Fala com o Run Again para receber um novo.",
      },
      { status: 409 },
    );
  }

  const { data: criado, error: erroCriacao } = await admin.auth.admin.createUser({
    email: convite.email,
    password: senha,
    email_confirm: true,
    app_metadata: { papel: "profissional" },
    user_metadata: { nome: convite.nome, especialidade: convite.especialidade },
  });

  if (erroCriacao || !criado?.user) {
    await admin
      .from("convites_profissional")
      .update({ usado_em: null })
      .eq("token", token);

    return NextResponse.json(
      { erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." },
      { status: 500 },
    );
  }

  const userId = criado.user.id;
  const agora = new Date().toISOString();

  const { error: erroPerfil } = await admin.from("usuarios").insert({
    id: userId,
    papel: "profissional",
    nome: convite.nome,
    especialidade: convite.especialidade,
    termos_aceitos_versao: TERMOS_VERSAO_ATUAL,
    termos_aceitos_em: agora,
  });

  if (erroPerfil) {
    await admin.auth.admin.deleteUser(userId);
    await admin
      .from("convites_profissional")
      .update({ usado_em: null })
      .eq("token", token);

    return NextResponse.json(
      { erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." },
      { status: 500 },
    );
  }

  await admin.from("audit_log").insert({
    usuario_id: userId,
    acao: "convite_profissional_aceito",
    entidade: "usuarios",
    entidade_id: userId,
  });

  return NextResponse.json({ ok: true, email: convite.email });
}
