import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { RedefinirSenhaForm } from "@/components/auth/RedefinirSenhaForm";

export const metadata: Metadata = { title: "Redefinir senha — Run Again" };

export default function RedefinirSenhaPage() {
  return (
    <AuthShell titulo="REDEFINIR SENHA">
      <RedefinirSenhaForm />
    </AuthShell>
  );
}
