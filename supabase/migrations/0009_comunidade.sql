-- Run Again — Comunidade (Feed de Evidências + Espaço Único de Discussão)
-- Estende 0001_fundacao.sql (usuarios, enums, eh_corredor/eh_profissional
-- vêm de 0003) e lê (sem gravar) tabelas do Fluxo 3 (0002/0005/0007) pra
-- calcular elegibilidade de compartilhamento em código (lib/comunidade/*),
-- nunca aqui dentro.
--
-- Fonte: PRD "Arquitetura de Produto — Comunidade (Feed de Evidências +
-- Espaço Único de Discussão)", que depende de
-- prds/fluxo-comunidade-feed-minimo.md (estratégia — regras de negócio
-- §5/§6) — esse segundo documento não está neste repositório. Mesma
-- lacuna já registrada em 0002/0004/0007/0008 pra essa classe de problema.
--
-- Escrita pra ser seguramente re-executável (idempotente), mesma convenção
-- de 0004/0005/0007/0008.
--
-- Nota de renumeração (QA do beta): este arquivo nasceu como 0008 — virou
-- 0009 porque 0006/0007 já estavam ocupados por lista_fundadoras e
-- nutrição quando este fluxo (até então só local, nunca enviado ao
-- repositório remoto) foi integrado. Nenhuma mudança de conteúdo, só de
-- número de arquivo (e das referências a outros arquivos renumerados
-- nestes comentários).
--
-- Duas decisões de engenharia que o PRD não define no nível de schema, e
-- que ficam registradas aqui por serem a única peça que "toca" código fora
-- deste fluxo:
--
-- (a) "Campo de flag 'já compartilhada' na origem de cada evidência" (§10.2
--     do PRD) tocaria 3+ tabelas do Fluxo 3 com granularidades diferentes
--     (avaliacoes = 1 linha/usuário, respostas_24h e sessoes_prescritas =
--     N linhas/usuário) — nenhuma delas representa sozinha "o card que a
--     Returnista vê agora", que já é uma leitura computada em
--     lib/painel/calculo.ts (banda atual, % de aderência, insight
--     templado). Em vez de bolt-on de colunas com semânticas diferentes em
--     tabelas heterogêneas, a flag vive numa tabela própria
--     (comunidade_evidencias_compartilhadas, item 2 abaixo), uma linha por
--     usuário+tipo de evidência, com a última "chave" (valor) compartilhada
--     — funcionalmente idêntica ao que o PRD pede (reoferece o convite só
--     quando o valor mudar), sem forçar 3 grãos de tabela diferentes a
--     carregar o mesmo conceito. Nenhuma tabela do Fluxo 3 é alterada.
--
-- (b) O feed (RF03) precisa mostrar o nome de quem postou, mas a RLS de
--     usuarios (0001/0003) não abre leitura de corredor pra corredor — só
--     "o próprio perfil" e "profissional lê corredor". Abrir isso pra toda
--     a tabela usuarios exporia persona/trial/termos de qualquer corredor
--     pra qualquer outro, só pra resolver "mostrar um nome". Em vez
--     disso, autor_nome é uma cópia (snapshot) do nome gravada no momento
--     do post/resposta — mesma filosofia de texto_evidencia (§6 do PRD:
--     "nunca uma segunda fonte de verdade", aqui aplicada ao nome de
--     exibição). usuarios não é tocado por esta migração.

-- 1. Posts (evidência RF02/RF03 + tópicos de conversa RF06) ------------------

do $$ begin
  create type public.tipo_post_comunidade as enum ('evidencia', 'conversa');
exception when duplicate_object then null;
end $$;

create table if not exists public.comunidade_posts (
  id                uuid primary key default gen_random_uuid(),
  autor_id          uuid not null references public.usuarios(id) on delete cascade,
  autor_nome        text not null,                    -- snapshot, ver nota (b) acima
  tipo              tipo_post_comunidade not null,

  -- Só para tipo='evidencia'. origem_pilar reaproveita o enum já existente
  -- (0001) para não abrir um domínio irmão — hoje só 'fisioterapia' é
  -- possível (as 4 evidências elegíveis, §1 do PRD, vêm todas do painel
  -- geral/Fisioterapia), mas o campo já existe pronto pra quando outro
  -- pilar tiver evidência elegível própria (migração aditiva, regra §6 do
  -- PRD: "adicionar depois é migração simples, não dívida técnica").
  origem_pilar      especialidade_profissional,
  tipo_evidencia    text check (tipo_evidencia in ('risco', 'carga_forma', 'aderencia', 'insight')),
  texto_evidencia   text,                              -- frase já formatada pelo painel, copiada literalmente (RF02-CA1)
  legenda           text check (legenda is null or char_length(legenda) <= 200),

  -- Só para tipo='conversa' (RF06).
  titulo            text check (titulo is null or char_length(titulo) <= 140),
  corpo             text check (corpo is null or char_length(corpo) <= 2000),

  deletado_em       timestamptz,                       -- soft delete (RF05-CA1), nunca hard delete
  criado_em         timestamptz not null default now(),

  constraint comunidade_posts_forma_por_tipo check (
    (tipo = 'evidencia' and origem_pilar is not null and tipo_evidencia is not null and texto_evidencia is not null
      and titulo is null and corpo is null)
    or
    (tipo = 'conversa' and origem_pilar is null and titulo is not null and length(trim(titulo)) > 0
      and corpo is not null and length(trim(corpo)) > 0
      and tipo_evidencia is null and texto_evidencia is null and legenda is null)
  )
);

-- RF03 — feed cronológico; RF06 — mural de conversa. Um índice por tipo
-- cobre as duas listagens (regra §6 do PRD: "nunca order by engajamento").
create index if not exists comunidade_posts_feed_idx
  on public.comunidade_posts (criado_em desc)
  where tipo = 'evidencia' and deletado_em is null;

create index if not exists comunidade_posts_conversa_idx
  on public.comunidade_posts (criado_em desc)
  where tipo = 'conversa' and deletado_em is null;

alter table public.comunidade_posts enable row level security;

-- Espaço só de corredor (§2 do PRD: "não tem jornada do lado profissional") —
-- sem policy de select para eh_profissional() de propósito. Moderação do
-- time acontece por acesso direto ao banco (item 8 do PRD, Supabase
-- Studio), que usa a role de owner do projeto e ignora RLS por padrão.
drop policy if exists "corredor le posts da comunidade" on public.comunidade_posts;
create policy "corredor le posts da comunidade"
  on public.comunidade_posts for select
  using (deletado_em is null and public.eh_corredor());

drop policy if exists "corredor publica o proprio post na comunidade" on public.comunidade_posts;
create policy "corredor publica o proprio post na comunidade"
  on public.comunidade_posts for insert
  with check (autor_id = auth.uid() and public.eh_corredor());

-- Sem policy de update/delete direta: RF05 (excluir) só existe via a
-- função definer abaixo (mesmo padrão de
-- marcar_checkins_psicologia_revisados, 0008) — impede editar conteúdo já
-- publicado (item 12 do PRD, SHOULD/LATER, não construído nesta versão) e
-- restringe a escrita ao único campo que a regra de negócio permite tocar.
create or replace function public.excluir_post_comunidade(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_corredor() then
    raise exception 'não autorizado';
  end if;

  update public.comunidade_posts
     set deletado_em = now()
   where id = p_post_id
     and autor_id = auth.uid()
     and deletado_em is null;
end;
$$;

revoke all on function public.excluir_post_comunidade(uuid) from public;
grant execute on function public.excluir_post_comunidade(uuid) to authenticated;

-- 2. Flag "já compartilhada" por tipo de evidência (RF01) — ver nota (a) ----

create table if not exists public.comunidade_evidencias_compartilhadas (
  id                uuid primary key default gen_random_uuid(),
  usuario_id        uuid not null references public.usuarios(id) on delete cascade,
  tipo_evidencia    text not null check (tipo_evidencia in ('risco', 'carga_forma', 'aderencia', 'insight')),
  chave             text not null,      -- snapshot do valor compartilhado (banda/percentual/frase) — reoferece o convite só quando mudar
  post_id           uuid references public.comunidade_posts(id) on delete set null,
  compartilhado_em  timestamptz not null default now(),

  unique (usuario_id, tipo_evidencia)
);

alter table public.comunidade_evidencias_compartilhadas enable row level security;

-- "Ler/gravar o meu próprio registro, sem regra de negócio que atravesse
-- usuários" — regra de fronteira da arquitetura técnica global (§1):
-- Next.js grava direto, RLS é a barreira, sem precisar de função definer.
drop policy if exists "corredor le a propria flag de compartilhamento" on public.comunidade_evidencias_compartilhadas;
create policy "corredor le a propria flag de compartilhamento"
  on public.comunidade_evidencias_compartilhadas for select
  using (usuario_id = auth.uid() and public.eh_corredor());

drop policy if exists "corredor grava a propria flag de compartilhamento" on public.comunidade_evidencias_compartilhadas;
create policy "corredor grava a propria flag de compartilhamento"
  on public.comunidade_evidencias_compartilhadas for insert
  with check (usuario_id = auth.uid() and public.eh_corredor());

drop policy if exists "corredor atualiza a propria flag de compartilhamento" on public.comunidade_evidencias_compartilhadas;
create policy "corredor atualiza a propria flag de compartilhamento"
  on public.comunidade_evidencias_compartilhadas for update
  using (usuario_id = auth.uid() and public.eh_corredor())
  with check (usuario_id = auth.uid() and public.eh_corredor());

-- 3. Respostas do espaço de conversa (RF07) -----------------------------------

create table if not exists public.comunidade_respostas (
  id            uuid primary key default gen_random_uuid(),
  topico_id     uuid not null references public.comunidade_posts(id) on delete cascade,
  autor_id      uuid not null references public.usuarios(id) on delete cascade,
  autor_nome    text not null,
  corpo         text not null check (length(trim(corpo)) > 0 and char_length(corpo) <= 2000),
  deletado_em   timestamptz,
  criado_em     timestamptz not null default now()
);

create index if not exists comunidade_respostas_topico_idx
  on public.comunidade_respostas (topico_id, criado_em asc)
  where deletado_em is null;

-- RF07-CA1 — sem aninhamento além de um nível: uma resposta só pode
-- apontar pra um post do tipo 'conversa', nunca pra outra resposta nem pra
-- um post de evidência.
create or replace function public.checar_topico_da_resposta_comunidade()
returns trigger
language plpgsql
as $$
declare
  v_tipo public.tipo_post_comunidade;
begin
  select tipo into v_tipo
  from public.comunidade_posts
  where id = new.topico_id and deletado_em is null;

  if v_tipo is null then
    raise exception 'tópico não encontrado ou removido';
  end if;

  if v_tipo <> 'conversa' then
    raise exception 'só é possível responder a um tópico do espaço de conversa';
  end if;

  return new;
end;
$$;

drop trigger if exists comunidade_respostas_checar_topico on public.comunidade_respostas;
create trigger comunidade_respostas_checar_topico
  before insert on public.comunidade_respostas
  for each row execute function public.checar_topico_da_resposta_comunidade();

alter table public.comunidade_respostas enable row level security;

drop policy if exists "corredor le respostas da comunidade" on public.comunidade_respostas;
create policy "corredor le respostas da comunidade"
  on public.comunidade_respostas for select
  using (deletado_em is null and public.eh_corredor());

drop policy if exists "corredor publica a propria resposta na comunidade" on public.comunidade_respostas;
create policy "corredor publica a propria resposta na comunidade"
  on public.comunidade_respostas for insert
  with check (autor_id = auth.uid() and public.eh_corredor());

create or replace function public.excluir_resposta_comunidade(p_resposta_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_corredor() then
    raise exception 'não autorizado';
  end if;

  update public.comunidade_respostas
     set deletado_em = now()
   where id = p_resposta_id
     and autor_id = auth.uid()
     and deletado_em is null;
end;
$$;

revoke all on function public.excluir_resposta_comunidade(uuid) from public;
grant execute on function public.excluir_resposta_comunidade(uuid) to authenticated;

-- 4. Reação única de apoio (RF04) ---------------------------------------------

create table if not exists public.comunidade_reacoes (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.comunidade_posts(id) on delete cascade,
  usuario_id    uuid not null references public.usuarios(id) on delete cascade,
  criado_em     timestamptz not null default now(),

  unique (post_id, usuario_id)
);

create index if not exists comunidade_reacoes_post_idx on public.comunidade_reacoes (post_id);

-- RF04.1 — "post que não é seu": reforçado aqui além da UI (defesa em
-- profundidade, mesmo padrão do resto do produto).
create or replace function public.checar_reacao_nao_e_proprio_post()
returns trigger
language plpgsql
as $$
declare
  v_autor uuid;
begin
  select autor_id into v_autor
  from public.comunidade_posts
  where id = new.post_id and deletado_em is null;

  if v_autor is null then
    raise exception 'post não encontrado ou removido';
  end if;

  if v_autor = new.usuario_id then
    raise exception 'não é possível reagir ao próprio post';
  end if;

  return new;
end;
$$;

drop trigger if exists comunidade_reacoes_checar_autor on public.comunidade_reacoes;
create trigger comunidade_reacoes_checar_autor
  before insert on public.comunidade_reacoes
  for each row execute function public.checar_reacao_nao_e_proprio_post();

alter table public.comunidade_reacoes enable row level security;

drop policy if exists "corredor le reacoes da comunidade" on public.comunidade_reacoes;
create policy "corredor le reacoes da comunidade"
  on public.comunidade_reacoes for select
  using (public.eh_corredor());

drop policy if exists "corredor reage como si mesmo" on public.comunidade_reacoes;
create policy "corredor reage como si mesmo"
  on public.comunidade_reacoes for insert
  with check (usuario_id = auth.uid() and public.eh_corredor());

-- RF04-CA1 — reagir de novo remove (toggle): DELETE real (não soft delete;
-- é metadado de interação, não conteúdo — nada a auditar aqui).
drop policy if exists "corredor remove a propria reacao" on public.comunidade_reacoes;
create policy "corredor remove a propria reacao"
  on public.comunidade_reacoes for delete
  using (usuario_id = auth.uid() and public.eh_corredor());

-- 5. Denúncias (RF08) — escopo mínimo, sem fila/painel dedicado ------------

create table if not exists public.comunidade_denuncias (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid references public.comunidade_posts(id) on delete cascade,
  resposta_id       uuid references public.comunidade_respostas(id) on delete cascade,
  denunciante_id    uuid not null references public.usuarios(id) on delete cascade,
  motivo            text check (motivo is null or char_length(motivo) <= 500),
  criado_em         timestamptz not null default now(),

  constraint comunidade_denuncias_um_alvo check (num_nonnulls(post_id, resposta_id) = 1)
);

alter table public.comunidade_denuncias enable row level security;

-- Sem policy de select para ninguém do lado app (nem autor, nem
-- denunciante, nem profissional): revisão é só via acesso direto do time
-- ao banco (item 14 do PRD — sem painel de moderação, sem fila). O
-- denunciante recebe confirmação no próprio retorno do insert, não por
-- releitura da linha.
drop policy if exists "corredor denuncia conteudo da comunidade" on public.comunidade_denuncias;
create policy "corredor denuncia conteudo da comunidade"
  on public.comunidade_denuncias for insert
  with check (denunciante_id = auth.uid() and public.eh_corredor());

-- 6. Onboarding do corredor (§7) ----------------------------------------------

alter table public.usuarios
  add column if not exists corredor_viu_onboarding_comunidade boolean not null default false;
