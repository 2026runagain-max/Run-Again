import type { Metadata } from "next";
import { AuthShell } from "@/components/layout/AuthShell";
import { CadastroForm } from "@/components/auth/CadastroForm";

export const metadata: Metadata = { title: "Criar conta — Run Again" };

export default function CadastroPage() {
  return (
    <AuthShell titulo="CRIAR CONTA">
      <CadastroForm />
    </AuthShell>
  );
}
