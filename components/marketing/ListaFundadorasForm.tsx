"use client";

import { useId, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SuccessState } from "@/components/estados/SuccessState";
import { createClient } from "@/lib/supabase/client";
import { listaFundadorasSchema } from "@/lib/leads/validation";

type Campo = "nome" | "email";

export interface ListaFundadorasFormProps {
  /** De onde no site este formulário foi disparado — grava em `origem`. */
  origem: "hero" | "cta-intermediario" | "cta-final" | "blog" | "explica" | "ebook";
  ctaLabel?: string;
  microtexto?: string;
  className?: string;
}

/**
 * Formulário único de captura de e-mail (§7 do PRD "Site Aberto") —
 * reaproveitado no hero da home, no CTA intermediário, no fim de artigo do
 * blog e no fim de /explica. Grava em `public.lista_fundadoras`
 * (migration 0006) via RLS — sem cartão, sem checkout.
 */
export function ListaFundadorasForm({
  origem,
  // Terminologia e reconciliação da lista de fundadores (decisão de
  // produto, 2026-09): esta lista serve exclusivamente pra receber
  // novidades e conteúdo por e-mail — quem entra aqui não ganha vaga, fila
  // ou acesso antecipado ao beta automaticamente. Só quem compra um
  // infoproduto tem o caminho direto de convite pro beta (decisão
  // separada, sem fluxo automático desta lista pra lá).
  ctaLabel = "Quero receber novidades do Run Again",
  microtexto = "Grátis. Sem cartão. Só pra receber novidades e conteúdo do Run Again por e-mail.",
  className,
}: ListaFundadorasFormProps) {
  const formId = useId();
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroGeral(null);

    const formData = new FormData(event.currentTarget);
    const valores = {
      nome: String(formData.get("nome") ?? ""),
      email: String(formData.get("email") ?? ""),
    };

    const parsed = listaFundadorasSchema.safeParse(valores);
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
      const supabase = createClient();
      const { error } = await supabase.from("lista_fundadoras").upsert(
        {
          nome: parsed.data.nome,
          email: parsed.data.email.toLowerCase(),
          origem,
        },
        { onConflict: "email", ignoreDuplicates: true },
      );

      if (error) {
        setErroGeral("Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
        return;
      }

      setEnviado(true);
    } catch {
      setErroGeral("Isso não devia ter acontecido. Tenta de novo em alguns segundos.");
    } finally {
      setCarregando(false);
    }
  }

  if (enviado) {
    return (
      <SuccessState
        titulo="Feito."
        subtitulo="Você já está na lista de fundadores. O ebook Corrida sem Lesão chega no seu e-mail, e você passa a receber novidades e conteúdo do Run Again por lá."
        className={className}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate aria-describedby={`${formId}-microtexto`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Input
          name="nome"
          label="Nome"
          autoComplete="name"
          error={erros.nome}
          containerClassName="sm:flex-1"
        />
        <Input
          name="email"
          type="email"
          label="E-mail"
          autoComplete="email"
          error={erros.email}
          containerClassName="sm:flex-1"
        />
      </div>

      {erroGeral && (
        <p className="mt-3 text-sm font-sans text-fire-text" role="alert">
          {erroGeral}
        </p>
      )}

      <Button type="submit" variant="primary" loading={carregando} className="mt-4 w-full sm:w-auto">
        {ctaLabel}
      </Button>

      {microtexto && (
        <p id={`${formId}-microtexto`} className="mt-2 text-xs font-sans text-mid">
          {microtexto}
        </p>
      )}
    </form>
  );
}
