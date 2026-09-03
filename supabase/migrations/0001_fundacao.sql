-- Run Again — Fluxo 1: Fundação Técnica
-- Schema essencial de identidade: perfis, convites e audit log.
-- Fonte: docs/arquitetura-tecnica-global.md secao 2.

create extension if not exists "pgcrypto";

create type papel_usuario as enum ('corredor', 'profissional');
create type persona_corredor as enum ('returnista', 'iniciante_consciente', 'amador_ambicioso');
create type especialidade_profissional as enum (
  'fisioterapia', 'educacao_fisica', 'nutricao_esportiva', 'medicina_esporte', 'psicologia_esporte'
);

-- 2.2 Perfil ---------------------------------------------------------------

create table public.usuarios (
  id                     uuid primary key references auth.users(id) on delete cascade,
  papel                  papel_usuario not null,
  nome                   text not null,
  persona                persona_corredor,
  especialidade          especialidade_profissional,
  trial_termina_em       timestamptz,
  termos_aceitos_versao  text not null,
  termos_aceitos_em      timestamptz not null,
  deletado_em            timestamptz,
  criado_em              timestamptz not null default now(),
  atualizado_em          timestamptz not null default now()
);

create or replace function public.set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger usuarios_set_atualizado_em
  before update on public.usuarios
  for each row execute function public.set_atualizado_em();

alter table public.usuarios enable row level security;

create policy "usuario le o proprio perfil"
  on public.usuarios for select
  using (auth.uid() = id);

create policy "usuario atualiza o proprio perfil"
  on public.usuarios for update
  using (auth.uid() = id);

-- Sem policy de insert/delete para o client: essas linhas só existem
-- via rota de servidor usando a service role key (bypassa RLS por design).

-- 2.3 Convites ---------------------------------------------------------------

create table public.convites_beta (
  codigo        text primary key,
  usos_maximos  int not null default 1,
  usos_atuais   int not null default 0,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now()
);

alter table public.convites_beta enable row level security;
-- Sem policy: nenhum client lê/escreve esta tabela diretamente.
-- A validação de código acontece na rota de servidor, via service role key.

-- Consumo atômico de vaga (evita duas abas gastarem a última vaga do mesmo código).
create or replace function public.consumir_convite_beta(p_codigo text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ok boolean;
begin
  update public.convites_beta
     set usos_atuais = usos_atuais + 1
   where codigo = p_codigo
     and ativo
     and usos_atuais < usos_maximos
  returning true into v_ok;

  return coalesce(v_ok, false);
end;
$$;

-- Compensação: se a criação da conta falhar depois de consumir a vaga, devolve.
create or replace function public.liberar_convite_beta(p_codigo text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.convites_beta
     set usos_atuais = greatest(usos_atuais - 1, 0)
   where codigo = p_codigo;
$$;

create table public.convites_profissional (
  token          uuid primary key default gen_random_uuid(),
  email          text not null,
  nome           text not null,
  especialidade  especialidade_profissional not null,
  criado_por     uuid references auth.users(id),
  expira_em      timestamptz not null,
  usado_em       timestamptz,
  criado_em      timestamptz not null default now()
);

-- Consumo atômico do token de convite (evita duas abas do mesmo link
-- criarem duas contas). Marca usado_em só se ainda estiver dentro da
-- validade e ainda não tiver sido usado.
create or replace function public.consumir_convite_profissional(p_token uuid)
returns public.convites_profissional
language plpgsql
security definer
set search_path = public
as $$
declare
  v_convite public.convites_profissional;
begin
  update public.convites_profissional
     set usado_em = now()
   where token = p_token
     and usado_em is null
     and expira_em > now()
  returning * into v_convite;

  return v_convite;
end;
$$;

alter table public.convites_profissional enable row level security;
-- Sem policy: leitura/escrita só via service role key na rota de servidor
-- que resolve o token do link de convite.

-- 2.5 Audit log ---------------------------------------------------------------

create table public.audit_log (
  id           bigint generated always as identity primary key,
  usuario_id   uuid references auth.users(id),
  acao         text not null,
  entidade     text,
  entidade_id  uuid,
  metadata     jsonb,
  criado_em    timestamptz not null default now()
);

alter table public.audit_log enable row level security;
-- Sem policy de leitura para o client neste fluxo: audit log é consumido
-- por ferramentas administrativas futuras, não pela UI do corredor/profissional.
