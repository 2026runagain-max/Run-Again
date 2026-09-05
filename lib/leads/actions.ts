"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { listaFundadorasSchema } from "./validation";
import { checarRateLimit, ipDaRequisicao } from "@/lib/security/rate-limit";

// 5 tentativas a cada 10 minutos por IP — generoso pro uso legítimo (uma
// pessoa não envia o mesmo formulário 5x em 10 min), curto o bastante pra
// travar um script batendo em sequência.
const LIMITE_LEAD = { limite: 5, janelaMs: 10 * 60 * 1000 };

type Resultado = { ok: true } | { ok: false; erro: string };

// Erro sempre genérico pro usuário (item 4 da auditoria de segurança) —
// nunca expõe detalhe técnico (nome de tabela, stack trace) numa tela.
const ERRO_GENERICO = "Isso não devia ter acontecido. Tenta de novo em alguns segundos.";

export type OrigemListaFundadoras = "hero" | "cta-intermediario" | "cta-final" | "blog" | "explica" | "ebook";

/**
 * Auditoria de segurança pré-lançamento (2026-09) — item 4. Antes, o
 * formulário gravava direto do navegador em `lista_fundadoras` via RLS
 * (`with check (true)` pra `anon`); qualquer requisição usando só a chave
 * anônima pública (a mesma que todo navegador já carrega) conseguia
 * escrever ali direto pela API REST do Supabase, sem passar por nenhuma
 * validação, limite de tentativas ou honeypot — não importa quanta
 * proteção o componente React tivesse, ela era só decoração de UX.
 *
 * Fix: a policy de insert público foi removida (migration
 * 0013_endurecer_lista_fundadoras.sql) — agora só a service role key
 * grava nesta tabela, e o único caminho até a service role key é esta
 * Server Action. Mesmo padrão que `convites_beta`/`convites_profissional`/
 * `audit_log` já usavam neste projeto.
 */
export async function inscreverNaListaFundadorasAction(input: {
  nome: string;
  email: string;
  origem: OrigemListaFundadoras;
  /** Campo honeypot — invisível pra gente de verdade, bot ingênuo preenche.
   * Vindo preenchido, finge sucesso sem gravar nada (nunca avisa o bot). */
  website?: string;
}): Promise<Resultado> {
  if (input.website) {
    return { ok: true };
  }

  const parsed = listaFundadorasSchema.safeParse({ nome: input.nome, email: input.email });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? ERRO_GENERICO };
  }

  const ip = ipDaRequisicao(await headers());
  if (!checarRateLimit(`lead:${ip}`, LIMITE_LEAD)) {
    return { ok: false, erro: ERRO_GENERICO };
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("lista_fundadoras").upsert(
      {
        nome: parsed.data.nome,
        email: parsed.data.email.toLowerCase(),
        origem: input.origem,
      },
      { onConflict: "email", ignoreDuplicates: true },
    );

    if (error) return { ok: false, erro: ERRO_GENERICO };
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
