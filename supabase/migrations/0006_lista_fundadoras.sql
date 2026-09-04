-- Run Again — Site Aberto: lista de fundadoras.
-- Captura de e-mail da home (copy/home-lista-fundadoras.md) e do fim de
-- artigo do blog / página /explica (§7 do PRD "Site Aberto"). Sem checkout,
-- sem CPF, sem cartão — só nome e e-mail.
--
-- Pendência registrada na própria copy de home: hoje isso grava só nesta
-- tabela, não está ligado a nenhuma ferramenta de e-mail marketing real
-- (Mailchimp/Resend/ConvertKit). Trocar depois sem perder o que já foi
-- coletado.

create table public.lista_fundadoras (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  email      text not null unique,
  origem     text, -- de que bloco da página veio: hero, cta-intermediario, blog, explica
  criado_em  timestamptz not null default now()
);

alter table public.lista_fundadoras enable row level security;

-- Qualquer visitante (logado ou não) pode se inscrever, mas ninguém lê a
-- lista pelo client — só via service role key (dashboard do Supabase hoje,
-- integração de e-mail marketing depois). E-mail é normalizado (lowercase)
-- antes do insert pelo próprio formulário, pra "unique" acima pegar
-- duplicata sem diferenciar caixa.
create policy "qualquer um pode se inscrever na lista de fundadoras"
  on public.lista_fundadoras for insert
  to anon, authenticated
  with check (true);
