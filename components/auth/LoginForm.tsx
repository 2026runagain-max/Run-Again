"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { mensagemDeErroAuth } from "@/lib/auth/erros";
import type { Papel } from "@/lib/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);

    const formData = new FormData(event.currentTarget);
    const valores = {
      email: String(formData.get("email") ?? ""),
      senha: String(formData.get("senha") ?? ""),
    };

    const parsed = loginSchema.safeParse(valores);
    if (!parsed.success) {
      const novosErros: { email?: string; senha?: string } = {};
      for (const issue of parsed.error.issues) {
        const campo = issue.path[0] as "email" | "senha";
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
      setErros(novosErros);
      return;
    }

    setErros({});
    setCarregando(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.senha,
      });

      if (error || !data.user) {
        setErroGeral(mensagemDeErroAuth(error));
        return;
      }

      const papel = data.user.app_metadata?.papel as Papel | undefined;
      const destinoPadrao = papel ? `/${papel}/painel` : "/";
      const redirect = searchParams.get("redirect");
      const destino =
        redirect && papel && redirect.startsWith(`/${papel}/`)
          ? redirect
          : destinoPadrao;

      router.push(destino);
      router.refresh();
    } catch {
      setErroGeral("Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        name="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        error={erros.email}
      />
      <Input
        name="senha"
        type="password"
        label="Senha"
        autoComplete="current-password"
        error={erros.senha}
      />

      <div className="-mt-2 text-right">
        <Link
          href="/recuperar-senha"
          className="text-sm font-sans text-fire-text hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      {erroGeral && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {erroGeral}
        </p>
      )}

      <Button type="submit" variant="primary" loading={carregando} className="mt-2">
        Entrar
      </Button>

      <p className="text-center text-sm font-sans text-mid">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-fire-text hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
