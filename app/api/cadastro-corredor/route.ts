import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cadastroCorredorSchema } from "@/lib/validation/auth";
import { TERMOS_VERSAO_ATUAL, TRIAL_DIAS } from "@/lib/legal";
import { mensagemDeErroAuth } from "@/lib/auth/erros";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cadastroCorredorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Confere os campos destacados e tenta de novo." },
      { status: 400 },
    );
  }

  const { nome, email, senha, codigoConvite } = parsed.data;
  const admin = createAdminClient();
  const codigo = codigoConvite.trim().toUpperCase();

  const { data: consumiu, error: erroConvite } = await admin.rpc(
    "consumir_convite_beta",
    { p_codigo: codigo },
  );

  if (erroConvite) {
    return NextResponse.json(
      { erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." },
      { status: 500 },
    );
  }

  if (!consumiu) {
    return NextResponse.json(
      {
        erro:
          "Esse código de convite não é válido ou já esgotou as vagas. Confere com quem te convidou.",
        campo: "codigoConvite",
      },
      { status: 400 },
    );
  }

  const { data: criado, error: erroCriacao } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    app_metadata: { papel: "corredor" },
    user_metadata: { nome },
  });

  if (erroCriacao || !criado?.user) {
    await admin.rpc("liberar_convite_beta", { p_codigo: codigo });
    const duplicado = /already registered|already exists/i.test(
      erroCriacao?.message ?? "",
    );
    return NextResponse.json(
      {
        erro: duplicado
          ? "Já existe uma conta com esse e-mail."
          : mensagemDeErroAuth(erroCriacao),
        campo: duplicado ? "email" : undefined,
      },
      { status: duplicado ? 409 : 500 },
    );
  }

  const userId = criado.user.id;
  const agora = new Date();
  const trialTerminaEm = new Date(agora);
  trialTerminaEm.setDate(trialTerminaEm.getDate() + TRIAL_DIAS);

  const { error: erroPerfil } = await admin.from("usuarios").insert({
    id: userId,
    papel: "corredor",
    nome,
    persona: null,
    trial_termina_em: trialTerminaEm.toISOString(),
    termos_aceitos_versao: TERMOS_VERSAO_ATUAL,
    termos_aceitos_em: agora.toISOString(),
  });

  if (erroPerfil) {
    await admin.auth.admin.deleteUser(userId);
    await admin.rpc("liberar_convite_beta", { p_codigo: codigo });
    return NextResponse.json(
      { erro: "Isso não devia ter acontecido. Tenta de novo em alguns segundos." },
      { status: 500 },
    );
  }

  await admin.from("audit_log").insert({
    usuario_id: userId,
    acao: "cadastro_corredor",
    entidade: "usuarios",
    entidade_id: userId,
    metadata: { codigo_convite: codigo },
  });

  return NextResponse.json({ ok: true });
}
