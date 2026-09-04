-- Run Again — Nutrição Esportiva (Orientação Alimentar Calculada)
-- Estende 0001_fundacao.sql, 0002_fisioterapia_prescricao.sql e
-- 0004_avaliacao_inicial.sql. Não repete nem recria nada de lá.
--
-- Nota de renumeração (QA do beta): este arquivo nasceu como 0006 — virou
-- 0007 porque 0006 já estava ocupado por lista_fundadoras quando este fluxo
-- (até então só local, nunca enviado ao repositório remoto) foi integrado.
-- Nenhuma mudança de conteúdo, só de número de arquivo.
--
-- Fonte: PRD de arquitetura de produto "Nutrição Esportiva — Orientação
-- Alimentar Calculada". Esse documento referencia
-- claude/motor-nutricao-esportiva-especificacao.md como "fonte única de
-- verdade clínica" (fórmulas exatas de energia/macro/hidratação/
-- suplementação, flags de triagem, faixas de validação) — esse arquivo não
-- está neste repositório. Mesma lacuna já registrada em
-- 0002_fisioterapia_prescricao.sql e 0004_avaliacao_inicial.sql para a
-- mesma classe de problema: o schema abaixo é dimensionado para sustentar
-- exatamente os RF01–RF13 do PRD (colunas, versionamento, origem,
-- triagem), mas os PESOS/FÓRMULAS/LIMIARES clínicos em si vivem em
-- lib/nutricao/motor.ts, comentados linha a linha como decisão desta
-- implementação (heurísticas conservadoras de nutrição esportiva),
-- pendente de revisão pela nutricionista responsável antes de sair do
-- beta — nunca apresentados como validados clinicamente até essa revisão.
--
-- Desvio de arquitetura registrado (não é omissão): o PRD descreve o
-- cálculo M03–M08 rodando num "Motor de Protocolos Clínicos" em
-- Python/FastAPI, chamado pelo Fastify (arquitetura-tecnica-global.md
-- §3.3). Este repositório não tem hoje nem apps/api (Fastify) nem um
-- serviço Python separado — é um único app Next.js. O cálculo roda em
-- lib/nutricao/motor.ts (TypeScript, server-only), chamado exclusivamente
-- a partir de server actions (nunca de código client) — a mesma fronteira
-- lógica que o Fastify ocuparia, só que colocada no mesmo processo por não
-- existir outro. Extrair isso para um serviço Python real (quando
-- justificar a complexidade adicional) é uma troca de *quem* chama a
-- função pura de lib/nutricao/motor.ts, não uma reescrita da lógica.
--
-- Escrita pra ser seguramente re-executável, mesma convenção de
-- 0004_avaliacao_inicial.sql e 0005_painel_progresso.sql.

-- 0. Onboarding do hub -----------------------------------------------------
-- Sem coluna de onboarding pro questionário (M02): igual à avaliação do
-- Fluxo 2, o passo 0 do wizard já é a tela de intro (RF12-CA1) — decidido
-- pela posição de retomada, não por uma flag própria (ver
-- app/corredor/nutricao/avaliacao/page.tsx).

-- 1. Enums -------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'nivel_automacao_nutricao') then
    -- N1/N2 (dado insuficiente) colapsam num único nível 'n2' nesta
    -- implementação: o wizard exige os campos que M04–M08 precisam antes de
    -- permitir concluir (RF01-CA3), então "dado insuficiente" só acontece em
    -- caso defensivo (linha corrompida/incompleta), não como jornada normal.
    -- RF13 (educação geral) cobre n2 e n4 com o mesmo conteúdo.
    create type nivel_automacao_nutricao as enum ('n2', 'n3', 'n4');
  end if;

  if not exists (select 1 from pg_type where typname = 'origem_orientacao_nutricao') then
    create type origem_orientacao_nutricao as enum ('calculada', 'ajustada_pela_equipe', 'definida_pela_equipe');
  end if;

  if not exists (select 1 from pg_type where typname = 'nutricao_status_nivel') then
    create type nutricao_status_nivel as enum ('verde', 'amarelo', 'vermelho');
  end if;

  if not exists (select 1 from pg_type where typname = 'caso_nutricao_tipo') then
    create type caso_nutricao_tipo as enum ('seguranca', 'revisao');
  end if;

  if not exists (select 1 from pg_type where typname = 'caso_nutricao_status') then
    -- Mesma máquina de estados (mínima) da Fisioterapia (atendimento_status,
    -- 0002), com um estágio a mais: 'em_atendimento' deixa explícito que
    -- alguém da equipe já assumiu o caso, pra dois profissionais não
    -- trabalharem o mesmo alerta em paralelo sem saber (RF09-CA2 reaproveita
    -- o modelo de prontuário/máquina de estados da Fisioterapia).
    create type caso_nutricao_status as enum ('aberto', 'em_atendimento', 'resolvido');
  end if;
end
$$;

-- 2. Extensão de public.usuarios (0001) --------------------------------------

alter table public.usuarios
  add column if not exists corredor_viu_onboarding_nutricao boolean not null default false;

-- 3. Avaliação nutricional (M02) ----------------------------------------------
-- Mesmo desenho de avaliacoes_iniciais (0004): um jsonb que cresce bloco a
-- bloco (progressive profiling + autosave, RF01-CA3), uma linha ativa por
-- corredor (edit-in-place — reabrir o questionário é RF15, SHOULD, fora do
-- beta como fluxo próprio; reeditar aqui é suficiente). Chaves de "respostas"
-- em camelCase, espelhando lib/validation/nutricao.ts 1:1 — mesma decisão
-- registrada em 0004.

create table if not exists public.avaliacoes_nutricionais (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null unique references public.usuarios(id) on delete cascade,
  respostas     jsonb not null default '{}'::jsonb,
  concluida_em  timestamptz,

  -- RF02-CA4 — resultado da triagem mais recente (M03), registrado aqui
  -- separado da fila de casos (casos_nutricao, abaixo): isto é o registro
  -- da decisão em si (pra a tela "Minha orientação" saber o que renderizar
  -- sem depender de haver ou não um caso de segurança aberto); a fila é o
  -- fluxo de trabalho da equipe em cima dessa decisão. "Nunca sobrescrito
  -- silenciosamente" (RF02-CA4) é satisfeito porque cada nova conclusão da
  -- avaliação sobrescreve estas colunas junto com uma nova linha em
  -- orientacoes_nutricionais (se n3) ou casos_nutricao (se n4) — o histórico
  -- de fato vive nessas duas tabelas, que são append-only.
  ultimo_nivel_automacao  nivel_automacao_nutricao,
  ultima_triagem_flags    text[] not null default '{}',
  ultima_triagem_em       timestamptz,

  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists avaliacoes_nutricionais_set_atualizado_em on public.avaliacoes_nutricionais;
create trigger avaliacoes_nutricionais_set_atualizado_em
  before update on public.avaliacoes_nutricionais
  for each row execute function public.set_atualizado_em();

alter table public.avaliacoes_nutricionais enable row level security;

drop policy if exists "corredor le a propria avaliacao nutricional" on public.avaliacoes_nutricionais;
create policy "corredor le a propria avaliacao nutricional"
  on public.avaliacoes_nutricionais for select
  using (usuario_id = auth.uid());

drop policy if exists "corredor cria a propria avaliacao nutricional" on public.avaliacoes_nutricionais;
create policy "corredor cria a propria avaliacao nutricional"
  on public.avaliacoes_nutricionais for insert
  with check (usuario_id = auth.uid());

drop policy if exists "corredor atualiza a propria avaliacao nutricional" on public.avaliacoes_nutricionais;
create policy "corredor atualiza a propria avaliacao nutricional"
  on public.avaliacoes_nutricionais for update
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

drop policy if exists "profissional le avaliacao nutricional de qualquer paciente" on public.avaliacoes_nutricionais;
create policy "profissional le avaliacao nutricional de qualquer paciente"
  on public.avaliacoes_nutricionais for select
  using (public.eh_profissional());

-- Autosave atômico de bloco — mesma razão de ser de salvar_bloco_avaliacao
-- (0004): mescla no banco, num único round-trip, sem read-modify-write no
-- client.
create or replace function public.salvar_bloco_avaliacao_nutricao(p_chave text, p_valor jsonb)
returns public.avaliacoes_nutricionais
language plpgsql
as $$
declare
  v_row public.avaliacoes_nutricionais;
begin
  if p_chave not in (
    'blocoBiometria', 'blocoObjetivo', 'blocoAlimentar', 'blocoDigestivo',
    'blocoSuplementos', 'blocoComportamento', 'blocoSaudeMenstrual'
  ) then
    raise exception 'chave de bloco inválida: %', p_chave;
  end if;

  insert into public.avaliacoes_nutricionais (usuario_id, respostas)
  values (auth.uid(), jsonb_build_object(p_chave, p_valor))
  on conflict (usuario_id) do update
    set respostas = avaliacoes_nutricionais.respostas || jsonb_build_object(p_chave, p_valor)
  returning * into v_row;

  return v_row;
end;
$$;

-- 4. Orientação nutricional (M04–M08 / RF03, RF04, RF06, RF09, RF10) ---------
-- Append-only, versionada por corredor (RF02-CA4: "nunca sobrescrito
-- silenciosamente"; RF06-CA3: "cada recálculo grava nova versão,
-- preservando a anterior"). "Vigente" = maior versao por usuario_id
-- (vw_orientacao_nutricao_vigente, abaixo).
--
-- energia/macros/timing/hidratacao/suplementacao em colunas jsonb próprias
-- (não um blob único): cada uma tem forma diferente e é lida por telas
-- diferentes (RF04, RF11, prontuário) — juntar tudo num "dado" genérico só
-- empurraria a validação de forma pra cada call site.

create table if not exists public.orientacoes_nutricionais (
  id                 uuid primary key default gen_random_uuid(),
  usuario_id         uuid not null references public.usuarios(id) on delete cascade,
  versao             int not null,

  nivel_automacao    nivel_automacao_nutricao not null,
  origem             origem_orientacao_nutricao not null,
  flags_triagem      text[] not null default '{}',

  -- Null quando nivel_automacao = 'n2'/'n4' (RF04-CA3: nunca número
  -- calculado nesses casos — RF03-CA1 só roda M04–M08 quando n3).
  energia            jsonb,
  macros             jsonb,
  timing             jsonb,
  hidratacao         jsonb,
  suplementacao      jsonb,

  motor_versao       text not null default 'placeholder-heuristico-2026-09',

  ajustado_por       uuid references public.usuarios(id),
  ajustado_em        timestamptz,
  caso_origem_id     uuid,

  criado_em          timestamptz not null default now(),

  unique (usuario_id, versao)
);

create index if not exists orientacoes_nutricionais_usuario_idx
  on public.orientacoes_nutricionais (usuario_id, versao desc);

alter table public.orientacoes_nutricionais enable row level security;

drop policy if exists "corredor le a propria orientacao" on public.orientacoes_nutricionais;
create policy "corredor le a propria orientacao"
  on public.orientacoes_nutricionais for select
  using (usuario_id = auth.uid());

drop policy if exists "profissional le orientacao de qualquer paciente" on public.orientacoes_nutricionais;
create policy "profissional le orientacao de qualquer paciente"
  on public.orientacoes_nutricionais for select
  using (public.eh_profissional());

-- RF03-CA4/RF09-CA3/RF10-CA3: a origem declarada tem que corresponder a quem
-- está gravando — nunca confiar em "origem" vindo só do formulário. O
-- corredor só pode inserir a própria linha com origem = 'calculada' (o
-- resultado do motor rodando a partir da conclusão do questionário dele
-- mesmo); qualquer origem que implique intervenção humana só entra por uma
-- policy restrita a eh_profissional().
drop policy if exists "corredor cria orientacao calculada propria" on public.orientacoes_nutricionais;
create policy "corredor cria orientacao calculada propria"
  on public.orientacoes_nutricionais for insert
  with check (usuario_id = auth.uid() and origem = 'calculada' and ajustado_por is null);

drop policy if exists "profissional cria orientacao ajustada" on public.orientacoes_nutricionais;
create policy "profissional cria orientacao ajustada"
  on public.orientacoes_nutricionais for insert
  with check (
    public.eh_profissional()
    and origem in ('ajustada_pela_equipe', 'definida_pela_equipe')
    and ajustado_por = auth.uid()
  );

-- Sem policy de update/delete: histórico é imutável, correção = nova versão
-- (mesma filosofia de performance_testes, 0002).

create or replace view public.vw_orientacao_nutricao_vigente
with (security_invoker = true) as
select distinct on (usuario_id) *
from public.orientacoes_nutricionais
order by usuario_id, versao desc;

-- 5. Registro alimentar (RF07) -------------------------------------------------
-- Nunca obrigatório, nunca bloqueia nenhuma tela (regra §6) — existe só pra
-- alimentar M10 (RF08) e dar contexto pro profissional na fila de revisão
-- (RF10-CA2).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'fonte_registro_alimentar') then
    create type fonte_registro_alimentar as enum ('open_food_facts', 'manual');
  end if;
  if not exists (select 1 from pg_type where typname = 'refeicao_tipo') then
    create type refeicao_tipo as enum (
      'cafe_da_manha', 'almoco', 'lanche', 'jantar', 'pre_treino', 'pos_treino', 'outra'
    );
  end if;
end
$$;

create table if not exists public.registros_alimentares (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid not null references public.usuarios(id) on delete cascade,
  fonte            fonte_registro_alimentar not null,
  nome_alimento    text not null,
  marca            text,
  porcao_descricao text,
  refeicao         refeicao_tipo not null,
  off_codigo       text, -- código do produto no Open Food Facts, quando fonte = 'open_food_facts'
  registrado_em    timestamptz not null default now(),
  criado_em        timestamptz not null default now()
);

create index if not exists registros_alimentares_usuario_idx
  on public.registros_alimentares (usuario_id, registrado_em desc);

alter table public.registros_alimentares enable row level security;

drop policy if exists "corredor le os proprios registros alimentares" on public.registros_alimentares;
create policy "corredor le os proprios registros alimentares"
  on public.registros_alimentares for select
  using (usuario_id = auth.uid());

drop policy if exists "profissional le registros alimentares de qualquer paciente" on public.registros_alimentares;
create policy "profissional le registros alimentares de qualquer paciente"
  on public.registros_alimentares for select
  using (public.eh_profissional());

drop policy if exists "corredor cria o proprio registro alimentar" on public.registros_alimentares;
create policy "corredor cria o proprio registro alimentar"
  on public.registros_alimentares for insert
  with check (usuario_id = auth.uid());

drop policy if exists "corredor apaga o proprio registro alimentar" on public.registros_alimentares;
create policy "corredor apaga o proprio registro alimentar"
  on public.registros_alimentares for delete
  using (usuario_id = auth.uid());

-- 6. Check-ins de monitoramento (M10 / RF08) -----------------------------------
-- Sinal qualitativo append-only (mesma filosofia de respostas_24h, 0002):
-- correção clínica é um novo check-in, não edição retroativa do anterior.
-- RF08-CA1 exige nunca decidir por variável isolada — a combinação vive em
-- lib/nutricao/motor.ts (calcularStatusNutricional), não em SQL.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'adesao_percebida_nutricao') then
    create type adesao_percebida_nutricao as enum ('consegui_seguir', 'segui_parcialmente', 'dificil_seguir');
  end if;
end
$$;

create table if not exists public.checkins_nutricao (
  id                  uuid primary key default gen_random_uuid(),
  usuario_id          uuid not null references public.usuarios(id) on delete cascade,
  fome_nivel          int not null check (fome_nivel between 0 and 10),
  energia_nivel       int not null check (energia_nivel between 0 and 10),
  desconforto_gi      int not null check (desconforto_gi between 0 and 10),
  adesao_percebida    adesao_percebida_nutricao not null,
  observacao          text,
  criado_em           timestamptz not null default now()
);

create index if not exists checkins_nutricao_usuario_idx
  on public.checkins_nutricao (usuario_id, criado_em desc);

alter table public.checkins_nutricao enable row level security;

drop policy if exists "corredor le os proprios checkins" on public.checkins_nutricao;
create policy "corredor le os proprios checkins"
  on public.checkins_nutricao for select
  using (usuario_id = auth.uid());

drop policy if exists "profissional le checkins de qualquer paciente" on public.checkins_nutricao;
create policy "profissional le checkins de qualquer paciente"
  on public.checkins_nutricao for select
  using (public.eh_profissional());

drop policy if exists "corredor cria o proprio checkin" on public.checkins_nutricao;
create policy "corredor cria o proprio checkin"
  on public.checkins_nutricao for insert
  with check (usuario_id = auth.uid());

-- 7. Casos de nutrição — fila de exceção (RF09, RF10) --------------------------
-- Duas naturezas (tipo): 'seguranca' (N4, dispara na triagem, RF09-CA1) e
-- 'revisao' (M10 amarelo/vermelho ou pedido do corredor, RF10-CA1) — mesma
-- tabela, filtradas por aba na tela (§3 do PRD: "duas abas: Segurança e
-- Revisão"), porque a máquina de estados (aberto → em_atendimento →
-- resolvido) e o vínculo com paciente/orientação são idênticos nas duas.

create table if not exists public.casos_nutricao (
  id                uuid primary key default gen_random_uuid(),
  usuario_id        uuid not null references public.usuarios(id) on delete cascade,
  tipo              caso_nutricao_tipo not null,
  status            caso_nutricao_status not null default 'aberto',
  motivo            text not null,
  flags             text[] not null default '{}',
  orientacao_id     uuid references public.orientacoes_nutricionais(id),
  atendido_por      uuid references public.usuarios(id),
  resolvido_em      timestamptz,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);

create index if not exists casos_nutricao_fila_idx
  on public.casos_nutricao (tipo, status, criado_em desc);

drop trigger if exists casos_nutricao_set_atualizado_em on public.casos_nutricao;
create trigger casos_nutricao_set_atualizado_em
  before update on public.casos_nutricao
  for each row execute function public.set_atualizado_em();

alter table public.casos_nutricao enable row level security;

drop policy if exists "profissional le todos os casos de nutricao" on public.casos_nutricao;
create policy "profissional le todos os casos de nutricao"
  on public.casos_nutricao for select
  using (public.eh_profissional());

-- Corredor só enxerga status/tipo do próprio caso via view restrita (coluna
-- "motivo"/"flags" fica de fora — vocabulário interno de triagem, nunca
-- exposto como está: regra §6, "vocabulário proibido do motor vale pra todo
-- texto do produto"). Mesmo padrão de vw_historico_atendimentos_corredor
-- (0005): view sem security_invoker, ela mesma é o mecanismo de restrição de
-- coluna.
create or replace view public.vw_casos_nutricao_corredor as
select id, tipo, status, criado_em, resolvido_em
from public.casos_nutricao
where usuario_id = auth.uid();

-- RF02-CA1/RF09-CA1: abrir caso de segurança é resultado direto e automático
-- da triagem (M03), disparado pela mesma server action que grava a
-- orientação N4 — não pelo client diretamente. eh_corredor() garante que só
-- a própria conta do corredor (nunca outro papel) pode abrir um caso sobre
-- si mesma; RF08-CA2/RF10-CA1 usam a mesma porta para abrir caso de revisão.
drop policy if exists "corredor abre caso sobre si mesmo" on public.casos_nutricao;
create policy "corredor abre caso sobre si mesmo"
  on public.casos_nutricao for insert
  with check (usuario_id = auth.uid() and public.eh_corredor());

drop policy if exists "profissional atualiza caso de nutricao" on public.casos_nutricao;
create policy "profissional atualiza caso de nutricao"
  on public.casos_nutricao for update
  using (public.eh_profissional())
  with check (public.eh_profissional());

-- Sem policy de select pro corredor na tabela em si (só a view restrita,
-- acima) — mas as próprias server actions do corredor (lib/nutricao/
-- actions.ts) precisam checar "eu já tenho um caso aberto deste tipo?" antes
-- de abrir outro, pra não duplicar caso a cada check-in/tentativa. Uma
-- policy de select cobrindo isso reabriria "motivo"/"flags" pro corredor via
-- REST direto — o que a view restrita existe justamente pra evitar. Uma
-- função security definer que devolve só um boolean resolve sem abrir
-- nenhuma coluna sensível.
create or replace function public.corredor_tem_caso_aberto(p_tipo caso_nutricao_tipo)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.casos_nutricao
    where usuario_id = auth.uid()
      and tipo = p_tipo
      and status in ('aberto', 'em_atendimento')
  );
$$;

revoke all on function public.corredor_tem_caso_aberto(caso_nutricao_tipo) from public;
grant execute on function public.corredor_tem_caso_aberto(caso_nutricao_tipo) to authenticated;
