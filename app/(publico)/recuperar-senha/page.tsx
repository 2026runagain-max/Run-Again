import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { RecuperarSenhaForm } from "@/components/auth/RecuperarSenhaForm";

export const metadata: Metadata = { title: "Recuperar senha — Run Again" };

export default function RecuperarSenhaPage() {
  return (
    <AuthShell titulo="RECUPERAR SENHA">
      <RecuperarSenhaForm />
    </AuthShell>
  );
}
