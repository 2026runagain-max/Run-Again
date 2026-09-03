"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cadastroCorredorSchema } from "@/lib/validation/auth";

type Campo = "nome" | "email" | "senha" | "codigoConvite" | "termosAceitos";

export function CadastroForm() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [termosAceitos, setTermosAceitos] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);

    const formData = new FormData(event.currentTarget);
    const valores = {
      nome: String(formData.get("nome") ?? ""),
      email: String(formData.get("email") ?? ""),
      senha: String(formData.get("senha") ?? ""),
      codigoConvite: String(formData.get("codigoConvite") ?? ""),
      termosAceitos,
    };

    const parsed = cadastroCorredorSchema.safeParse(valores);
    if (!parsed.success) {
      const novosErros: Partial<Record<Campo, string>> = {};
      for (const issue of parsed.error.issues) {
        const campo = issue.path[0] as Campo;
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
      setErros(novosErros);
      return;
    }

    setErros({});
    setCarregando(true);

    try {
      const resposta = await fetch("/api/cadastro-corredor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const resultado = await resposta.json();

      if (!resposta.ok) {
        if (resultado.campo) {
          setErros((prev) => ({ ...prev, [resultado.campo]: resultado.erro }));
        } else {
          setErroGeral(resultado.erro ?? "Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
        }
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.senha,
      });

      if (error) {
        setErroGeral("Conta criada. Entra com sua senha na tela de login.");
        router.push("/login");
        return;
      }

      router.push("/corredor/painel");
      router.refresh();
    } catch {
      setErroGeral("Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input name="nome" label="Nome completo" autoComplete="name" error={erros.nome} />
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
        autoComplete="new-password"
        hint="Pelo menos 8 caracteres."
        error={erros.senha}
      />
      <Input
        name="codigoConvite"
        label="Código de convite de beta"
        autoComplete="off"
        error={erros.codigoConvite}
      />

      <label className="flex items-start gap-2 text-sm font-sans text-mid">
        <input
          type="checkbox"
          checked={termosAceitos}
          onChange={(e) => setTermosAceitos(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-mid/40 text-fire focus:ring-fire/30"
        />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="text-fire hover:underline">
            termos de uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="text-fire hover:underline">
            política de privacidade
          </Link>
          .
        </span>
      </label>
      {erros.termosAceitos && (
        <p className="-mt-2 text-xs font-sans text-fire" role="alert">
          {erros.termosAceitos}
        </p>
      )}

      {erroGeral && (
        <p className="text-sm font-sans text-fire" role="alert">
          {erroGeral}
        </p>
      )}

      <Button type="submit" variant="primary" loading={carregando} className="mt-2">
        Criar conta
      </Button>

      <p className="text-center text-sm font-sans text-mid">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-fire hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
