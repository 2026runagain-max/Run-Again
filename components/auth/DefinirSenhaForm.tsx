"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { definirSenhaConviteSchema } from "@/lib/validation/auth";

export interface DefinirSenhaFormProps {
  token: string;
  nome: string;
}

export function DefinirSenhaForm({ token, nome }: DefinirSenhaFormProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<{ senha?: string; confirmarSenha?: string }>({});
  const [termosAceitos, setTermosAceitos] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);

    if (!termosAceitos) {
      setErroGeral("É preciso aceitar os termos de uso e a política de privacidade.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const valores = {
      senha: String(formData.get("senha") ?? ""),
      confirmarSenha: String(formData.get("confirmarSenha") ?? ""),
    };

    const parsed = definirSenhaConviteSchema.safeParse(valores);
    if (!parsed.success) {
      const novosErros: { senha?: string; confirmarSenha?: string } = {};
      for (const issue of parsed.error.issues) {
        const campo = issue.path[0] as "senha" | "confirmarSenha";
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
      setErros(novosErros);
      return;
    }

    setErros({});
    setCarregando(true);

    try {
      const resposta = await fetch("/api/aceitar-convite-profissional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha: parsed.data.senha }),
      });
      const resultado = await resposta.json();

      if (!resposta.ok) {
        setErroGeral(resultado.erro ?? "Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: resultado.email,
        password: parsed.data.senha,
      });

      if (error) {
        router.push("/login");
        return;
      }

      router.push("/profissional/painel");
      router.refresh();
    } catch {
      setErroGeral("Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <p className="text-sm font-sans text-mid">
        Olá, <span className="font-semibold text-ink">{nome}</span>. Define sua senha
        para ativar a conta na Equipe Run Again.
      </p>

      <Input
        name="senha"
        type="password"
        label="Senha"
        autoComplete="new-password"
        hint="Pelo menos 8 caracteres."
        error={erros.senha}
      />
      <Input
        name="confirmarSenha"
        type="password"
        label="Confirmar senha"
        autoComplete="new-password"
        error={erros.confirmarSenha}
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

      {erroGeral && (
        <p className="text-sm font-sans text-fire" role="alert">
          {erroGeral}
        </p>
      )}

      <Button type="submit" variant="primary" loading={carregando} className="mt-2">
        Ativar conta
      </Button>
    </form>
  );
}
