import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { TERMOS_VERSAO_ATUAL } from "@/lib/legal";
import { checarRateLimit, ipDaRequisicao } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  token: z.uuid(),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

// Auditoria de segurança pré-lançamento (2026-09), item 4 — mesma defesa em
// profundidade do cadastro de corredor. Risco bem menor aqui (o token é um
// UUID aleatório, não adivinhável por força bruta na prática), mas o custo
// de adicionar é baixo e mantém as duas rotas de "aceitar convite"
// consistentes.
const LIMITE_CONVITE = { limite: 8, janelaMs: 15 * 60 * 1000 };

export async function POST(request: Request) {
  const ip = ipDaRequisicao(request.headers);
  if (!checarRateLimit(`convite-profissional:${ip}`, LIMITE_CONVITE)) {
    return NextResponse.json(
      { erro: "Muitas tentativas seguidas. Espera alguns minutos e tenta de novo." },
      { status: 429 },
    );
  }

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
