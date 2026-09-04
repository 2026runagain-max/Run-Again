-- Run Again — Fisioterapia: Prescrição Clínica
-- Estende o schema de 0001_fundacao.sql. Não repete nem recria nada de lá.
--
-- Este fluxo depende de um doc técnico (prds/fluxo-fisioterapia-prescricao-clinica-
-- requisitos.md) que define RF-A a RF-E — máquina de estados de atendimento,
-- prontuário, radar de 9 capacidades, testes seriados e evolução/assimetria.
-- Esse documento não está no repositório nesta migração; o schema abaixo
-- implementa RF-A a RF-E (a base clínica) e RF-F a RF-K (visibilidade para o
-- corredor, telas de sessão/evolução, carga de vida) descritos no PRD de
-- arquitetura de produto. Decisões de design que o doc técnico ausente teria
-- fixado estão comentadas inline, para revisão explícita.

-- 0. Enums -------------------------------------------------------------------

create type atendimento_status as enum ('em_andamento', 'finalizado');

-- As 9 capacidades do radar (RF-C). Nomes internos (profissional); a tradução
-- para linguagem de corredor vive em código (lib/fisioterapia/labels.ts,
-- RF-I1 exige revisão de tom, não reaproveitar rótulo interno).
create type capacidade_radar as enum (
  'forca',
  'potencia',
  'resistencia_muscular',
  'mobilidade',
  'estabilidade',
  'equilibrio',
  'capacidade_aerobia',
  'controle_motor',
  'amplitude_movimento'
);

create type lado_corpo as enum ('esquerdo', 'direito', 'bilateral');
create type zona_resposta as enum ('verde', 'amarela', 'vermelha');
create type carga_vida as enum ('tranquila', 'normal', 'carregada', 'muito_carregada');
create type funcao_dia_seguinte as enum ('normal', 'levemente_limitada', 'muito_limitada');
create type estagio_exercicio as enum ('inicial', 'intermediario', 'avancado');

-- Condição clínica principal do atendimento — usada como um dos três eixos da
-- correspondência estruturada simples do motor de recomendação do beta
-- (condição + estágio + equipamento; ver item 13 do PRD de produto — o motor
-- de ranking completo via tags fica LATER, fora deste fluxo).
create type condicao_clinica as enum (
  'tendinopatia_patelar',
  'tendinopatia_aquiles',
  'fasciite_plantar',
  'entorse_tornozelo',
  'lesao_isquiotibiais',
  'sindrome_trato_iliotibial',
  'sindrome_dor_femoropatelar',
  'dor_lombar',
  'outra'
);

-- 0.1 Extensão de public.usuarios (0001) -------------------------------------

alter table public.usuarios
  add column corredor_viu_onboarding_prescricao boolean not null default false;

-- Profissional precisa localizar e ler o perfil de qualquer corredor para
-- montar o prontuário (RF-B1: "busca de paciente = corredor real"). A policy
-- de 0001 só permite ao usuário ler o próprio perfil; esta é aditiva.
create policy "profissional le perfil de corredor"
  on public.usuarios for select
  using (
    papel = 'corredor'
    and exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.papel = 'profissional'
    )
  );

-- 0.2 Helpers de RLS ----------------------------------------------------------
-- Evita repetir a subquery em toda policy. Roda como invoker (não security
-- definer): a subquery interna a usuarios só enxerga a própria linha do
-- usuário logado, que é exatamente o que a policy de self-select de 0001 já
-- libera — sem recursão e sem precisar de privilégio extra.

create or replace function public.eh_profissional()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.usuarios u where u.id = auth.uid() and u.papel = 'profissional'
  );
$$;

create or replace function public.eh_corredor()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.usuarios u where u.id = auth.uid() and u.papel = 'corredor'
  );
$$;

-- 1. Atendimentos (RF-A) ------------------------------------------------------
-- Máquina de estados mínima: em_andamento -> finalizado. Índice único parcial
-- impede dois atendimentos abertos ao mesmo tempo para o mesmo paciente
-- (sustenta o "card de continuidade", RF-B3).

create table public.atendimentos (
  id                  uuid primary key default gen_random_uuid(),
  paciente_id         uuid not null references public.usuarios(id),
  profissional_id     uuid not null references public.usuarios(id),
  status              atendimento_status not null default 'em_andamento',
  condicao_principal  condicao_clinica,
  queixa_principal    text,
  historico_subjetivo text,
  observacoes_objetivas text,
  iniciado_em         timestamptz not null default now(),
  finalizado_em       timestamptz,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

create unique index atendimentos_um_aberto_por_paciente
  on public.atendimentos (paciente_id)
  where status = 'em_andamento';

create index atendimentos_paciente_idx on public.atendimentos (paciente_id, iniciado_em desc);

create trigger atendimentos_set_atualizado_em
  before update on public.atendimentos
  for each row execute function public.set_atualizado_em();

alter table public.atendimentos enable row level security;

create policy "profissional le todos atendimentos"
  on public.atendimentos for select
  using (public.eh_profissional() or paciente_id = auth.uid());

create policy "profissional cria atendimento proprio"
  on public.atendimentos for insert
  with check (public.eh_profissional() and profissional_id = auth.uid());

create policy "profissional atualiza atendimento proprio"
  on public.atendimentos for update
  using (profissional_id = auth.uid())
  with check (profissional_id = auth.uid());

-- 2. Testes seriados de performance (RF-C) -----------------------------------
-- Log de medições, append-only por design (correção clínica = nova medição,
-- não edição retroativa — mesma lógica de um diário de evolução).
-- meta_clinica é a meta usada para o score 0-100 (RF-C2-CA2: percentual da
-- meta clínica, nunca percentil populacional).

create table public.performance_testes (
  id              uuid primary key default gen_random_uuid(),
  paciente_id     uuid not null references public.usuarios(id),
  atendimento_id  uuid references public.atendimentos(id),
  capacidade      capacidade_radar not null,
  nome            text not null,
  unidade         text not null,
  lado            lado_corpo not null default 'bilateral',
  valor           numeric not null check (valor >= 0),
  meta_clinica    numeric not null check (meta_clinica > 0),
  medido_em       timestamptz not null default now(),
  criado_por      uuid not null references public.usuarios(id),
  criado_em       timestamptz not null default now()
);

create index performance_testes_paciente_idx
  on public.performance_testes (paciente_id, capacidade, nome, unidade, lado, medido_em);

alter table public.performance_testes enable row level security;

create policy "leitura de performance por dono do dado"
  on public.performance_testes for select
  using (public.eh_profissional() or paciente_id = auth.uid());

create policy "profissional registra performance"
  on public.performance_testes for insert
  with check (public.eh_profissional() and criado_por = auth.uid());

-- 3. Views de evolução/assimetria (RF-D) --------------------------------------
-- security_invoker garante que a RLS de performance_testes (acima) continua
-- valendo para quem consulta a view — sem isso, uma view do Postgres roda com
-- o privilégio de quem a criou, o que vazaria dado entre pacientes.

create view public.vw_evolucao_testes
with (security_invoker = true) as
with historico as (
  select
    pt.*,
    round(least(pt.valor / nullif(pt.meta_clinica, 0) * 100, 100))::int as score,
    row_number() over (
      partition by pt.paciente_id, pt.capacidade, pt.nome, pt.unidade, pt.lado
      order by pt.medido_em desc
    ) as ordem_desc,
    count(*) over (
      partition by pt.paciente_id, pt.capacidade, pt.nome, pt.unidade, pt.lado
    ) as total_medicoes,
    first_value(pt.valor) over (
      partition by pt.paciente_id, pt.capacidade, pt.nome, pt.unidade, pt.lado
      order by pt.medido_em asc
    ) as valor_inicial
  from public.performance_testes pt
)
select
  paciente_id,
  capacidade,
  nome,
  unidade,
  lado,
  valor as valor_atual,
  meta_clinica,
  score,
  medido_em as medido_em_atual,
  valor_inicial,
  total_medicoes,
  case
    when total_medicoes >= 2 and valor_inicial <> 0
      then round(((valor - valor_inicial) / valor_inicial) * 100, 1)
    else null
  end as evolucao_pct
from historico
where ordem_desc = 1;

-- Assimetria E/D: pareia o teste mais recente do lado esquerdo com o do lado
-- direito, mesmo domínio (capacidade + nome + unidade) — mesma regra de
-- agrupamento de vw_evolucao_testes, estendida ao par de lados.
create view public.vw_assimetria_testes
with (security_invoker = true) as
select
  e.paciente_id,
  e.capacidade,
  e.nome,
  e.unidade,
  e.valor_atual as valor_esquerdo,
  d.valor_atual as valor_direito,
  round(
    abs(e.valor_atual - d.valor_atual) / greatest(e.valor_atual, d.valor_atual, 0.0001) * 100,
    1
  ) as assimetria_pct,
  -- Assimetria na primeira medição comparável de cada lado, para o insight
  -- poder dizer "caiu de X% para Y%" (RF-J) quando os dois lados já tiverem
  -- pelo menos duas medições cada.
  case
    when e.total_medicoes >= 2 and d.total_medicoes >= 2 then
      round(
        abs(e.valor_inicial - d.valor_inicial)
          / greatest(e.valor_inicial, d.valor_inicial, 0.0001) * 100,
        1
      )
    else null
  end as assimetria_pct_inicial,
  greatest(e.medido_em_atual, d.medido_em_atual) as medido_em_mais_recente
from public.vw_evolucao_testes e
join public.vw_evolucao_testes d
  on e.paciente_id = d.paciente_id
 and e.capacidade = d.capacidade
 and e.nome = d.nome
 and e.unidade = d.unidade
 and e.lado = 'esquerdo'
 and d.lado = 'direito';

-- Radar de 9 capacidades: score médio das medições mais recentes de cada
-- capacidade (uma capacidade pode ter mais de um teste nomeado).
create view public.vw_radar_capacidades
with (security_invoker = true) as
select
  paciente_id,
  capacidade,
  round(avg(score))::int as score,
  max(medido_em_atual) as atualizado_em,
  count(*) as total_testes
from public.vw_evolucao_testes
group by paciente_id, capacidade;

-- 4. Catálogo de exercícios ----------------------------------------------------
-- Correspondência estruturada simples (condição + estágio + equipamento) —
-- decisão explícita de escopo do beta (item 13 do PRD de produto). O motor de
-- ranking completo via tags substitui isto depois, fora deste fluxo.

create table public.exercicios_catalogo (
  id                    uuid primary key default gen_random_uuid(),
  nome                  text not null,
  capacidade            capacidade_radar not null,
  condicao              condicao_clinica,
  estagio               estagio_exercicio not null default 'inicial',
  equipamento           text not null default 'nenhum',
  explicacao_corredor   text not null,
  criado_em             timestamptz not null default now()
);

alter table public.exercicios_catalogo enable row level security;

create policy "usuario autenticado le o catalogo"
  on public.exercicios_catalogo for select
  using (auth.uid() is not null);

-- Sem policy de insert/update/delete para o client: catálogo é curado por
-- migração/engenharia neste beta (sem tela de admin — fora de escopo).

-- 5. Sessão prescrita (RF-B/E/F) -----------------------------------------------

create table public.sessoes_prescritas (
  id                      uuid primary key default gen_random_uuid(),
  atendimento_id          uuid not null references public.atendimentos(id),
  paciente_id             uuid not null references public.usuarios(id),
  profissional_id         uuid not null references public.usuarios(id),
  titulo                  text not null default 'Sessão prescrita',
  observacoes             text,
  visivel_para_corredor   boolean not null default false,
  enviada_em              timestamptz,
  criado_em               timestamptz not null default now(),
  atualizado_em           timestamptz not null default now()
);

create index sessoes_prescritas_paciente_idx
  on public.sessoes_prescritas (paciente_id, visivel_para_corredor, criado_em desc);

create trigger sessoes_prescritas_set_atualizado_em
  before update on public.sessoes_prescritas
  for each row execute function public.set_atualizado_em();

alter table public.sessoes_prescritas enable row level security;

-- RF-F2: corredor só lê a sessão quando explicitamente enviada.
create policy "corredor le sessao enviada"
  on public.sessoes_prescritas for select
  using (
    public.eh_profissional()
    or (paciente_id = auth.uid() and visivel_para_corredor = true)
  );

create policy "profissional cria sessao"
  on public.sessoes_prescritas for insert
  with check (public.eh_profissional() and profissional_id = auth.uid());

-- RF-F1-CA2: editar (inclusive alternar visivel_para_corredor) continua
-- possível depois de enviada — sem "congelamento" de versão neste beta.
create policy "profissional edita sessao propria"
  on public.sessoes_prescritas for update
  using (profissional_id = auth.uid())
  with check (profissional_id = auth.uid());

create table public.sessao_exercicios (
  id              uuid primary key default gen_random_uuid(),
  sessao_id       uuid not null references public.sessoes_prescritas(id) on delete cascade,
  exercicio_id    uuid not null references public.exercicios_catalogo(id),
  series          int,
  repeticoes      int,
  carga_ou_tempo  text,
  ordem           int not null default 0,
  criado_em       timestamptz not null default now()
);

create index sessao_exercicios_sessao_idx on public.sessao_exercicios (sessao_id, ordem);

alter table public.sessao_exercicios enable row level security;

create policy "leitura de exercicios da sessao"
  on public.sessao_exercicios for select
  using (
    exists (
      select 1 from public.sessoes_prescritas s
      where s.id = sessao_id
        and (
          public.eh_profissional()
          or (s.paciente_id = auth.uid() and s.visivel_para_corredor = true)
        )
    )
  );

create policy "profissional monta exercicios da sessao"
  on public.sessao_exercicios for insert
  with check (
    exists (
      select 1 from public.sessoes_prescritas s
      where s.id = sessao_id and s.profissional_id = auth.uid()
    )
  );

create policy "profissional edita exercicios da sessao"
  on public.sessao_exercicios for update
  using (
    exists (
      select 1 from public.sessoes_prescritas s
      where s.id = sessao_id and s.profissional_id = auth.uid()
    )
  );

create policy "profissional remove exercicios da sessao"
  on public.sessao_exercicios for delete
  using (
    exists (
      select 1 from public.sessoes_prescritas s
      where s.id = sessao_id and s.profissional_id = auth.uid()
    )
  );

-- 6. Resposta 24h + carga de vida (RF-G/H/K) -----------------------------------
-- Log append-only (imutável depois de enviado — é registro clínico do que o
-- corredor sentiu, não um formulário editável).

create table public.respostas_24h (
  id                    uuid primary key default gen_random_uuid(),
  sessao_id             uuid not null references public.sessoes_prescritas(id),
  paciente_id           uuid not null references public.usuarios(id),
  dor_durante           int not null check (dor_durante between 0 and 10),
  esforco_percebido     int not null check (esforco_percebido between 0 and 10),
  dor_24h               int not null check (dor_24h between 0 and 10),
  funcao_dia_seguinte   funcao_dia_seguinte not null,
  -- Sinal qualitativo autorrelatado (§6 do PRD de produto — resolve a Lacuna
  -- 11 do doc técnico). Mesma coluna vai poder ser preenchida por um pilar de
  -- treino/volume no futuro em vez de autorrelato — sem migração de dado.
  carga_vida_percebida     carga_vida,
  carga_vida_observacao    text,
  zona                  zona_resposta not null,
  criado_em             timestamptz not null default now()
);

create index respostas_24h_sessao_idx on public.respostas_24h (sessao_id, criado_em desc);
create index respostas_24h_paciente_idx on public.respostas_24h (paciente_id, criado_em desc);

-- Zona é threshold determinístico sobre dor/RPE (regra de negócio §6 do PRD de
-- produto) — não é decisão do motor de protocolos, por isso vive em SQL puro,
-- não no motor Python. O trigger ignora qualquer valor de "zona" vindo do
-- client e sempre recalcula no servidor.
create or replace function public.calcular_zona_resposta(
  p_dor_durante int, p_esforco int, p_dor_24h int
)
returns zona_resposta
language plpgsql
immutable
as $$
begin
  if p_dor_24h >= 7 or p_dor_durante >= 7 then
    return 'vermelha';
  elsif p_dor_24h >= 4 or p_dor_durante >= 4 or p_esforco >= 9 then
    return 'amarela';
  else
    return 'verde';
  end if;
end;
$$;

create or replace function public.set_zona_resposta_24h()
returns trigger
language plpgsql
as $$
begin
  new.zona := public.calcular_zona_resposta(new.dor_durante, new.esforco_percebido, new.dor_24h);
  return new;
end;
$$;

create trigger respostas_24h_set_zona
  before insert on public.respostas_24h
  for each row execute function public.set_zona_resposta_24h();

alter table public.respostas_24h enable row level security;

create policy "leitura de resposta 24h por dono do dado"
  on public.respostas_24h for select
  using (public.eh_profissional() or paciente_id = auth.uid());

-- RF-H: só o próprio corredor registra, e só sobre uma sessão que ele
-- realmente pode ver (evita registrar resposta sobre sessão de outra pessoa
-- ou ainda não enviada).
create policy "corredor registra resposta 24h"
  on public.respostas_24h for insert
  with check (
    paciente_id = auth.uid()
    and exists (
      select 1 from public.sessoes_prescritas s
      where s.id = sessao_id
        and s.paciente_id = auth.uid()
        and s.visivel_para_corredor = true
    )
  );

-- 7. Catálogo semente -----------------------------------------------------------
-- Cobertura mínima das 9 capacidades, com variação de estágio/condição para o
-- matching estruturado de "Criar sessão com foco atual" (RF-E) ter o que
-- escolher. Copy em voz de marca: por que o exercício, não só a dose.

insert into public.exercicios_catalogo
  (nome, capacidade, condicao, estagio, equipamento, explicacao_corredor)
values
  ('Ponte de glúteo unilateral', 'forca', null, 'inicial', 'nenhum',
   'Constrói força de posterior de coxa e glúteo sem sobrecarregar o joelho — a base antes de voltar a correr forte.'),
  ('Agachamento búlgaro', 'forca', 'sindrome_dor_femoropatelar', 'intermediario', 'nenhum',
   'Trabalha quadríceps e glúteo em cadeia unilateral, do jeito que a corrida exige de cada perna por vez.'),
  ('Levantamento terra romeno unilateral', 'forca', 'lesao_isquiotibiais', 'avancado', 'halteres',
   'Fortalece posterior de coxa sob controle excêntrico — a ação que mais protege contra reincidência de lesão nesse grupo muscular.'),
  ('Nórdico de isquiotibiais assistido', 'potencia', 'lesao_isquiotibiais', 'intermediario', 'nenhum',
   'Constrói a potência de frenagem do posterior de coxa — a capacidade mais associada à prevenção de nova lesão nesse músculo.'),
  ('Saltos verticais submáximos', 'potencia', null, 'avancado', 'nenhum',
   'Reintroduz impacto de forma controlada, medindo quanta potência sua perna já devolve com segurança.'),
  ('Step-up com carga', 'potencia', 'tendinopatia_patelar', 'intermediario', 'halteres',
   'Produz força rápida no quadríceps em amplitude parecida com a fase de apoio da corrida.'),
  ('Panturrilha unilateral até a falha', 'resistencia_muscular', 'tendinopatia_aquiles', 'inicial', 'nenhum',
   'Constrói a resistência do tendão de Aquiles a repetir esforço — exatamente o que cada passada pede dele.'),
  ('Prancha com marcha', 'resistencia_muscular', 'dor_lombar', 'inicial', 'nenhum',
   'Ensina o tronco a resistir rotação enquanto os braços e pernas se movem — a mesma exigência da corrida.'),
  ('Circuito de agachamento + afundo', 'resistencia_muscular', null, 'intermediario', 'nenhum',
   'Constrói resistência de posterior de coxa e quadríceps para sustentar a técnica de corrida quando o cansaço chega.'),
  ('Mobilidade de tornozelo em parede', 'mobilidade', 'entorse_tornozelo', 'inicial', 'nenhum',
   'Devolve a amplitude de dorsiflexão que o tornozelo perdeu — sem ela, o corpo compensa em outra articulação.'),
  ('Mobilidade de quadril em 4 apoios', 'mobilidade', 'sindrome_trato_iliotibial', 'inicial', 'nenhum',
   'Libera rotação de quadril — quando ela falta, o trato iliotibial assume trabalho que não é dele.'),
  ('Alongamento dinâmico de posterior de coxa', 'mobilidade', 'lesao_isquiotibiais', 'inicial', 'nenhum',
   'Prepara o músculo para o comprimento que ele precisa atingir a cada passada, sem forçar além do que já é seguro.'),
  ('Prancha lateral com elevação de quadril', 'estabilidade', 'dor_lombar', 'intermediario', 'nenhum',
   'Treina o tronco a estabilizar a pelve enquanto a perna se move — é isso que evita a queda de quadril na corrida.'),
  ('Dead bug com carga', 'estabilidade', null, 'inicial', 'nenhum',
   'Ensina o core a manter a coluna estável enquanto braços e pernas trabalham — a base de qualquer retorno seguro.'),
  ('Apoio unipodal em superfície instável', 'equilibrio', 'entorse_tornozelo', 'intermediario', 'nenhum',
   'Retreina o tornozelo a reagir a uma superfície irregular — o cenário real de qualquer trilha ou piso incerto.'),
  ('Apoio unipodal de olhos fechados', 'equilibrio', null, 'avancado', 'nenhum',
   'Tira a referência visual para forçar o corpo a confiar só na propriocepção — o próximo nível de controle de equilíbrio.'),
  ('Caminhada progressiva em esteira ou pista', 'capacidade_aerobia', null, 'inicial', 'nenhum',
   'Reconstrói a base aeróbia sem o impacto repetitivo da corrida — o primeiro degrau do retorno.'),
  ('Bike ergométrica em intervalos leves', 'capacidade_aerobia', 'tendinopatia_patelar', 'intermediario', 'nenhum',
   'Mantém o condicionamento aeróbio enquanto o joelho ainda não tolera o impacto total da corrida.'),
  ('Corrida em piscina (deep water running)', 'capacidade_aerobia', null, 'avancado', 'nenhum',
   'Simula o gesto da corrida com zero impacto — ponte entre a reabilitação e a pista.'),
  ('Marcha com padrão cruzado controlado', 'controle_motor', 'sindrome_dor_femoropatelar', 'inicial', 'nenhum',
   'Reeduca o padrão de movimento do quadril e joelho antes de acelerar o ritmo — controle vem antes de velocidade.'),
  ('Corrida em skipping baixo', 'controle_motor', null, 'intermediario', 'nenhum',
   'Refina a mecânica da passada em baixa velocidade, onde dá pra corrigir o padrão antes de correr forte de novo.'),
  ('Mobilização ativa de quadril em decúbito', 'amplitude_movimento', 'sindrome_trato_iliotibial', 'inicial', 'nenhum',
   'Recupera a amplitude de extensão de quadril que a corrida em velocidade exige a cada passada.'),
  ('Mobilidade de tornozelo com step', 'amplitude_movimento', 'tendinopatia_aquiles', 'intermediario', 'step',
   'Ganha amplitude de dorsiflexão sob carga — a exigência real do tendão de Aquiles durante o apoio.');
