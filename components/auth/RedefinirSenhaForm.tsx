"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/estados/LoadingState";
import { SuccessState } from "@/components/estados/SuccessState";
import { ErrorState } from "@/components/estados/ErrorState";
import { createClient } from "@/lib/supabase/client";
import { redefinirSenhaSchema } from "@/lib/validation/auth";
import { mensagemDeErroAuth } from "@/lib/auth/erros";

type EstadoLink = "verificando" | "valido" | "invalido";

export function RedefinirSenhaForm() {
  const [estadoLink, setEstadoLink] = useState<EstadoLink>("verificando");
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<{ senha?: string; confirmarSenha?: string }>({});
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setEstadoLink("valido");
      }
    });

    // Se o link já foi consumido nesta aba antes deste efeito montar,
    // o evento PASSWORD_RECOVERY pode não disparar de novo — nesse caso
    // uma sessão ativa já é sinal suficiente de link válido.
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setEstadoLink((atual) => (atual === "valido" ? atual : data.session ? "valido" : "invalido"));
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);

    const formData = new FormData(event.currentTarget);
    const valores = {
      senha: String(formData.get("senha") ?? ""),
      confirmarSenha: String(formData.get("confirmarSenha") ?? ""),
    };

    const parsed = redefinirSenhaSchema.safeParse(valores);
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
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: parsed.data.senha });

      if (error) {
        setErroGeral(mensagemDeErroAuth(error));
        return;
      }

      await fetch("/api/encerrar-sessoes", { method: "POST" });
      setConcluido(true);
    } catch {
      setErroGeral("Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
    } finally {
      setCarregando(false);
    }
  }

  if (estadoLink === "verificando") {
    return <LoadingState subtitulo="Confirmando seu link." />;
  }

  if (estadoLink === "invalido") {
    return (
      <ErrorState
        titulo="Esse link não é mais válido."
        subtitulo="Ele já foi usado ou expirou. Pede um novo link de redefinição."
        ctaLabel="Pedir novo link"
        ctaHref="/recuperar-senha"
      />
    );
  }

  if (concluido) {
    return (
      <SuccessState
        subtitulo="Sua senha foi redefinida. Todas as outras sessões foram encerradas — entra de novo com a senha nova."
        ctaLabel="Ir para o login"
        ctaHref="/login"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        name="senha"
        type="password"
        label="Nova senha"
        autoComplete="new-password"
        hint="Pelo menos 8 caracteres."
        error={erros.senha}
      />
      <Input
        name="confirmarSenha"
        type="password"
        label="Confirmar nova senha"
        autoComplete="new-password"
        error={erros.confirmarSenha}
      />

      {erroGeral && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {erroGeral}
        </p>
      )}

      <Button type="submit" variant="primary" loading={carregando} className="mt-2">
        Redefinir senha
      </Button>
    </form>
  );
}
