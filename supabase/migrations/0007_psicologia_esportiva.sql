-- Run Again — Psicologia do Esporte (Check-ins Periódicos e Sinalização Cruzada)
-- Estende 0001_fundacao.sql, 0002_fisioterapia_prescricao.sql e
-- 0004_avaliacao_inicial.sql. Não repete nem recria nada de lá.
--
-- Fonte: PRD de arquitetura de produto "Psicologia do Esporte — Check-ins
-- Periódicos e Sinalização Cruzada", que por sua vez depende de
-- prds/fluxo-psicologia-esporte-checkins.md (estratégia: zonas, regras de
-- negócio, limiar determinístico §4.1) — esse segundo documento não está
-- neste repositório. Mesma lacuna já registrada em 0002/0004/0006 para a
-- mesma classe de problema: o schema e o limiar abaixo
-- (calcular_zona_psicologica) são uma decisão desta implementação —
-- PLACEHOLDER pendente de revisão pelo psicólogo responsável antes de sair
-- do beta, nunca apresentado como validado clinicamente até essa revisão.
--
-- Escrita pra ser seguramente re-executável (idempotente), mesma convenção
-- de 0004/0005/0006.

-- 0. Extensão de public.atendimentos (0002) — múltiplas especialidades ------
-- RF-5 do PRD depende disto explicitamente (§10.2: "estrutura genérica de
-- atendimentos do Fluxo 1 já aceitar múltiplas especialidades" é
-- pré-requisito de engenharia deste fluxo; §10.3 passo 1: "extensão de
-- atendimentos para aceitar especialidade psicologia, se ainda não
-- aceitar"). atendimentos nasceu implicitamente fisioterapia-only (nenhuma
-- coluna de especialidade) — default 'fisioterapia' preserva todo o código
-- existente (lib/fisioterapia/*) sem precisar tocar nele.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'atendimentos' and column_name = 'especialidade'
  ) then
    alter table public.atendimentos
      add column especialidade especialidade_profissional not null default 'fisioterapia';
  end if;
end
$$;

-- O índice único original (0002) impedia DOIS atendimentos abertos por
-- paciente em QUALQUER especialidade — errado agora que um corredor pode
-- ter um atendimento de fisioterapia E um de psicologia abertos ao mesmo
-- tempo. Refeito por (paciente_id, especialidade).
drop index if exists atendimentos_um_aberto_por_paciente;
create unique index atendimentos_um_aberto_por_paciente
  on public.atendimentos (paciente_id, especialidade)
  where status = 'em_andamento';

create index if not exists atendimentos_especialidade_idx
  on public.atendimentos (paciente_id, especialidade, iniciado_em desc);

-- 1. Check-ins periódicos (RF-1/RF-2/RF-3) ------------------------------------
-- Append-only (mesma filosofia de respostas_24h, 0002): correção clínica é
-- um novo check-in, nunca edição retroativa. Reaproveita o enum
-- zona_resposta (0002) — mesmo domínio de 3 níveis, mesma semântica visual
-- (ZonaBadge já existente) — sem criar um enum irmão idêntico.

create table if not exists public.checkins_psicologia (
  id                  uuid primary key default gen_random_uuid(),
  usuario_id          uuid not null references public.usuarios(id) on delete cascade,

  -- C1/C2 — mesmos eixos do Bloco E do diagnóstico inicial (confiança/medo),
  -- agora medidos de novo ao longo do tempo (§1 do PRD: "mesmos eixos do
  -- Bloco E"). C3 é só contexto, nunca entra no cálculo de zona (RF-2 só
  -- cita C1/C2/C5). C4 é texto livre, nunca classificado automaticamente
  -- (RF-3-CA1). C5 é o pedido direto de conversa.
  c1_confianca        int not null check (c1_confianca between 0 and 10),
  c2_medo             int not null check (c2_medo between 0 and 10),
  c3_disposicao       int check (c3_disposicao between 0 and 10),
  c4_texto_livre      text,
  c5_quer_conversar   boolean not null default false,

  zona                zona_resposta not null,

  -- RF-3-CA2: marcação de revisão humana do texto livre — nunca
  -- interpretação automática do conteúdo, só "alguém já olhou isto".
  c4_revisado_em      timestamptz,
  c4_revisado_por     uuid references public.usuarios(id),

  criado_em           timestamptz not null default now()
);

create index if not exists checkins_psicologia_usuario_idx
  on public.checkins_psicologia (usuario_id, criado_em desc);

create index if not exists checkins_psicologia_texto_livre_idx
  on public.checkins_psicologia (usuario_id)
  where c4_texto_livre is not null and c4_revisado_em is null;

-- RF-2 — limiar determinístico. C5 vence tudo (CA2: "pedido direto sempre
-- vence o cálculo de threshold"); depois piso de confiança / teto de medo
-- absolutos; delta só entra quando existe check-in anterior (CA1: sem
-- anterior, usa só valores absolutos — nunca delta indefinido tratado como
-- zero). Limiares (3/8/5/6, delta 3) são PLACEHOLDER desta implementação —
-- ver nota de topo do arquivo.
create or replace function public.calcular_zona_psicologica(
  p_c1_atual int, p_c2_atual int, p_c5_atual boolean,
  p_c1_anterior int, p_c2_anterior int
)
returns zona_resposta
language plpgsql
immutable
as $$
begin
  if p_c5_atual then
    return 'vermelha';
  end if;

  if p_c1_atual <= 3 or p_c2_atual >= 8 then
    return 'vermelha';
  end if;

  if p_c1_anterior is not null and p_c2_anterior is not null then
    if (p_c1_atual - p_c1_anterior) <= -3 or (p_c2_atual - p_c2_anterior) >= 3 then
      return 'amarela';
    end if;
  end if;

  if p_c1_atual <= 5 or p_c2_atual >= 6 then
    return 'amarela';
  end if;

  return 'verde';
end;
$$;

-- Zona nunca confia em valor vindo do client (mesmo padrão de
-- set_zona_resposta_24h, 0002): busca o check-in anterior do mesmo usuário e
-- recalcula sempre no servidor, dentro da própria transação de insert.
create or replace function public.set_zona_checkin_psicologia()
returns trigger
language plpgsql
as $$
declare
  v_anterior record;
begin
  select c1_confianca, c2_medo into v_anterior
  from public.checkins_psicologia
  where usuario_id = new.usuario_id
  order by criado_em desc
  limit 1;

  new.zona := public.calcular_zona_psicologica(
    new.c1_confianca, new.c2_medo, new.c5_quer_conversar,
    v_anterior.c1_confianca, v_anterior.c2_medo
  );

  if new.c4_texto_livre is not null and length(trim(new.c4_texto_livre)) = 0 then
    new.c4_texto_livre := null;
  end if;

  return new;
end;
$$;

drop trigger if exists checkins_psicologia_set_zona on public.checkins_psicologia;
create trigger checkins_psicologia_set_zona
  before insert on public.checkins_psicologia
  for each row execute function public.set_zona_checkin_psicologia();

alter table public.checkins_psicologia enable row level security;

drop policy if exists "corredor le os proprios checkins de psicologia" on public.checkins_psicologia;
create policy "corredor le os proprios checkins de psicologia"
  on public.checkins_psicologia for select
  using (usuario_id = auth.uid());

drop policy if exists "profissional le checkins de psicologia de qualquer corredor" on public.checkins_psicologia;
create policy "profissional le checkins de psicologia de qualquer corredor"
  on public.checkins_psicologia for select
  using (public.eh_profissional());

drop policy if exists "corredor registra o proprio checkin de psicologia" on public.checkins_psicologia;
create policy "corredor registra o proprio checkin de psicologia"
  on public.checkins_psicologia for insert
  with check (usuario_id = auth.uid() and public.eh_corredor());

-- RF-3-CA2: só marca como revisado (nunca altera C1-C5/zona) — mesmo
-- raciocínio de "escopo de escrita mínimo" de marcar_exercicio_concluido
-- (0005): um UPDATE de linha inteira liberaria campo clínico pro
-- profissional editar, o que nunca é a intenção aqui. Sem policy de UPDATE
-- direta pra eh_profissional() de propósito — só esta função abre a porta.
create or replace function public.marcar_checkins_psicologia_revisados(p_usuario_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.eh_profissional() then
    raise exception 'não autorizado';
  end if;

  update public.checkins_psicologia
     set c4_revisado_em = now(), c4_revisado_por = auth.uid()
   where usuario_id = p_usuario_id
     and c4_texto_livre is not null
     and c4_revisado_em is null;
end;
$$;

revoke all on function public.marcar_checkins_psicologia_revisados(uuid) from public;
grant execute on function public.marcar_checkins_psicologia_revisados(uuid) to authenticated;

-- 2. Sinalização cruzada — badge no prontuário de fisioterapia (RF-6) --------
-- Evento de contexto, append-only, nunca editável — aviso, nunca ajuste de
-- sessão (RF-6-CA2). Gravado automaticamente pela mesma server action que
-- grava o check-in (lib/psicologia/actions.ts), com a sessão do próprio
-- corredor — por isso a policy de insert abaixo, e não uma função definer:
-- é o próprio corredor gravando um evento sobre si mesmo, não uma escrita
-- de terceiro.

create table if not exists public.sinais_psicologia_fisioterapia (
  id            uuid primary key default gen_random_uuid(),
  usuario_id    uuid not null references public.usuarios(id) on delete cascade,
  checkin_id    uuid not null references public.checkins_psicologia(id) on delete cascade,
  zona          zona_resposta not null,
  frase         text not null,
  criado_em     timestamptz not null default now()
);

create index if not exists sinais_psicologia_fisioterapia_usuario_idx
  on public.sinais_psicologia_fisioterapia (usuario_id, criado_em desc);

alter table public.sinais_psicologia_fisioterapia enable row level security;

-- RF-6-CA1: "legível pelo papel fisioterapeuta" — qualquer profissional
-- pode ler (mesma simplificação já adotada em todo o resto do produto: o
-- beta não modela vínculo profissional↔especialidade↔paciente).
drop policy if exists "profissional le sinais cruzados de psicologia" on public.sinais_psicologia_fisioterapia;
create policy "profissional le sinais cruzados de psicologia"
  on public.sinais_psicologia_fisioterapia for select
  using (public.eh_profissional());

-- O corredor nunca lê isto: é conteúdo do prontuário do profissional, não
-- uma tela do corredor (RF-6-CA2, "conteúdo de leitura").
drop policy if exists "corredor grava o proprio sinal cruzado" on public.sinais_psicologia_fisioterapia;
create policy "corredor grava o proprio sinal cruzado"
  on public.sinais_psicologia_fisioterapia for insert
  with check (usuario_id = auth.uid() and public.eh_corredor());

-- 3. Cadência automática (RF-8) — nenhuma coluna nova ------------------------
-- A data do próximo check-in esperado é sempre recalculada em código
-- (lib/psicologia/calculo.ts) a partir do histórico real de zonas — mesma
-- filosofia de "nunca persistir o que dá pra derivar" já usada no card de
-- continuidade da Fisioterapia (RF-B3: "recalculado sob demanda, nunca
-- persistido separadamente").

-- 4. Onboarding do corredor (§7) ----------------------------------------------

alter table public.usuarios
  add column if not exists corredor_viu_onboarding_psicologia boolean not null default false;
