-- Run Again — Fisioterapia: corrige recursão infinita de RLS em usuarios.
--
-- Causa: a policy "profissional le perfil de corredor" (0002) tem uma
-- subquery inline em public.usuarios, avaliada pelo papel do usuário
-- chamador — sujeita à própria RLS de usuarios. Como essa policy se aplica a
-- qualquer select em usuarios, a subquery reavalia a mesma policy de novo,
-- indefinidamente ("infinite recursion detected in policy for relation
-- usuarios", erro 42P17). Isso quebra leitura de perfil pra qualquer
-- usuário, não só a tela nova.
--
-- Fix padrão Postgres/Supabase pra esse caso: mover a checagem de papel pra
-- dentro de uma função security definer. Rodando como o dono da tabela
-- (não como o papel do chamador), essa consulta interna não é mais
-- avaliada pela RLS de usuarios — sem recursão. eh_profissional()/
-- eh_corredor() só devolvem um boolean derivado de auth.uid(), sem receber
-- parâmetro nenhum do chamador, então não abrem brecha de segurança.

create or replace function public.eh_profissional()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios u where u.id = auth.uid() and u.papel = 'profissional'
  );
$$;

create or replace function public.eh_corredor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.usuarios u where u.id = auth.uid() and u.papel = 'corredor'
  );
$$;

drop policy if exists "profissional le perfil de corredor" on public.usuarios;

create policy "profissional le perfil de corredor"
  on public.usuarios for select
  using (papel = 'corredor' and public.eh_profissional());
