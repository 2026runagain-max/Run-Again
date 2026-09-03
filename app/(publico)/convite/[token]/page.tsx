import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { DefinirSenhaForm } from "@/components/auth/DefinirSenhaForm";
import { ErrorState } from "@/components/estados/ErrorState";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Aceitar convite — Run Again" };

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: convite } = await admin
    .from("convites_profissional")
    .select("token, nome, usado_em, expira_em")
    .eq("token", token)
    .maybeSingle();

  const valido =
    !!convite && !convite.usado_em && new Date(convite.expira_em) > new Date();

  return (
    <AuthShell titulo="DEFINIR SENHA">
      {valido ? (
        <DefinirSenhaForm token={token} nome={convite.nome} />
      ) : (
        <ErrorState
          titulo="Esse convite não é mais válido."
          subtitulo="Ele expirou ou já foi usado. Fala com o Run Again para receber um novo link."
          ctaLabel="Voltar ao início"
          ctaHref="/"
        />
      )}
    </AuthShell>
  );
}
