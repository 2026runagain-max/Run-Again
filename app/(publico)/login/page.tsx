import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingState } from "@/components/estados/LoadingState";

export const metadata: Metadata = { title: "Entrar — Run Again" };

export default function LoginPage() {
  return (
    <AuthShell titulo="ENTRAR">
      <Suspense fallback={<LoadingState />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
