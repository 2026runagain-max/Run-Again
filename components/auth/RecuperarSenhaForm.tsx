"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessState } from "@/components/estados/SuccessState";
import { createClient } from "@/lib/supabase/client";
import { solicitarRecuperacaoSchema } from "@/lib/validation/auth";

export function RecuperarSenhaForm() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | undefined>();
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");

    const parsed = solicitarRecuperacaoSchema.safeParse({ email });
    if (!parsed.success) {
      setErro(parsed.error.issues[0]?.message);
      return;
    }

    setErro(undefined);
    setCarregando(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/recuperar-senha/redefinir`,
    });

    // A mesma confirmação aparece exista ou não o e-mail na base (RF03-CA1).
    setCarregando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <SuccessState
        titulo="Link enviado."
        subtitulo="Se esse e-mail estiver cadastrado, você recebe um link para redefinir a senha nos próximos minutos."
        ctaLabel="Voltar ao login"
        ctaHref="/login"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input name="email" type="email" label="E-mail" autoComplete="email" error={erro} />
      <Button type="submit" variant="primary" loading={carregando} className="mt-2">
        Enviar link
      </Button>
    </form>
  );
}
