-- Run Again — Fluxo 2: Onboarding, Avaliação Multidimensional e Diagnóstico Inicial
-- Estende 0001_fundacao.sql. Não repete nem recria nada de lá.
--
-- Fonte: claude/arquitetura-de-produto-fluxo-2-onboarding-avaliacao-diagnostico.md
-- (§10.3, passo 1). Esse documento referencia prds/fluxo-2-onboarding-avaliacao-
-- diagnostico.md para o texto exato dos Blocos A–H e os pesos de risco — esse
-- segundo arquivo não está neste repositório nesta migração. As perguntas dos
-- blocos (lib/avaliacao/copy.ts) e os pesos determinísticos do diagnóstico
-- (lib/avaliacao/diagnostico.ts) foram construídos a partir das pistas
-- estruturais que o documento de arquitetura já fixa (nomes de bloco, RF06-CA2,
-- ramificação de A, variação de E2 por persona, carga de vida no bloco F) e
-- estão comentados inline nos dois arquivos para revisão explícita de produto
-- antes de sair do beta — mesma decisão já registrada em
-- 0002_fisioterapia_prescricao.sql para o mesmo tipo de lacuna.
--
-- Escrita pra ser seguramente re-executável (idempotente): cada objeto só é
-- criado se ainda não existir. Isso não é enfeite — é porque colar este
-- arquivo direto no SQL Editor do painel (em vez de `supabase db push`, que
-- controla o que já rodou) deixa a re-execução manual como cenário real, e
-- uma migração que quebra na segunda vez que roda é uma armadilha.

-- 0. Extensão de public.usuarios (0001) -----------------------------------
-- Consentimento específico de dado de saúde (RF01, LGPD art. 11) — distinto
-- do consentimento genérico de termos_aceitos_versao/termos_aceitos_em (0001),
-- que cobre identificação, não dado de saúde.

alter table public.usuarios
  add column if not exists consentimento_saude_versao text,
  add column if not exists consentimento_saude_em     timestamptz;

-- 1. Diagnóstico -------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'banda_risco_nivel') then
    create type banda_risco_nivel as enum ('baixo', 'moderado', 'alto');
  end if;
end
$$;

-- Uma avaliação ativa por corredor (edit-in-place — RF09/SHOULD não guarda
-- histórico de versão nesta fase, decisão já registrada no PRD §4 item 9:
-- "versão anterior mantida no histórico" fica para quando a tela de
-- comparação existir). RF03-CA2/RF07-CA2 exigem retomar do bloco não
-- concluído — por isso "respostas" é um único jsonb que cresce bloco a
-- bloco, em vez de uma linha por bloco: evita modelar 8 tabelas quase
-- idênticas para uma escala de 50 pessoas.
--
-- Chaves de "respostas" são camelCase de propósito: o blob é opaco ao
-- Postgres (sem coluna/constraint por campo) e espelha 1:1 o nome de campo
-- usado em lib/validation/avaliacao.ts e nos formulários — sem camada de
-- mapeamento snake_case↔camelCase que essa escala não justifica.
create table if not exists public.avaliacoes_iniciais (
  id                        uuid primary key default gen_random_uuid(),
  usuario_id                uuid not null unique references public.usuarios(id) on delete cascade,

  respostas                 jsonb not null default '{}'::jsonb,

  -- RF04 — diagnóstico. Tudo null até a avaliação ser concluída (RF04-CA1:
  -- nunca parcial). risco_score é o número interno usado para ordenar os
  -- pontos de atenção e decidir a banda — nunca exibido sozinho na UI
  -- (RF05-CA1); a banda sempre vem com frase.
  risco_score               int check (risco_score between 0 and 100),
  -- Nomeia quem a pessoa é (Returnista / ambição legítima / começo com
  -- atenção) na voz do manifesto — ver nota em lib/avaliacao/diagnostico.ts,
  -- calcularFraseIdentidade(). É o primeiro parágrafo do diagnóstico, não
  -- um rótulo: por isso texto livre, não enum.
  frase_identidade          text,
  banda_risco               banda_risco_nivel,
  banda_risco_frase         text,
  perfil_biomecanico_flags  text[] not null default '{}',
  perfil_biomecanico_frase  text,
  perfil_psicologico_frase  text,
  -- Array de no máximo 3 objetos {titulo, texto} (RF04-CA4) — validado em
  -- código (lib/avaliacao/diagnostico.ts), não em constraint de banco.
  pontos_atencao            jsonb not null default '[]'::jsonb,
  concluida_em              timestamptz,

  -- RF06 — notificação à equipe por e-mail. Desligada no beta por decisão
  -- de produto (lib/avaliacao/actions.ts não chama mais o envio) — as
  -- colunas continuam aqui, só ficam sempre null por enquanto, prontas pra
  -- quando isso reativar.
  notificado_equipe_em      timestamptz,
  notificacao_erro          text,

  criado_em                 timestamptz not null default now(),
  atualizado_em             timestamptz not null default now()
);

-- Defesa extra pra quando a tabela já existe de uma tentativa anterior
-- (parcial ou de uma versão mais antiga deste arquivo): garante que toda
-- coluna atual existe, mesmo que CREATE TABLE IF NOT EXISTS acima não tenha
-- criado nada por já haver uma tabela mais velha. O check 0-100 de
-- risco_score fica só na definição do CREATE TABLE (Postgres não tem ADD
-- CONSTRAINT IF NOT EXISTS) — a faixa já é garantida em código
-- (lib/avaliacao/diagnostico.ts), então a ausência do check aqui num
-- cenário de tabela pré-existente não é um risco real.
alter table public.avaliacoes_iniciais
  add column if not exists risco_score               int,
  add column if not exists frase_identidade          text,
  add column if not exists banda_risco               banda_risco_nivel,
  add column if not exists banda_risco_frase         text,
  add column if not exists perfil_biomecanico_flags  text[] not null default '{}',
  add column if not exists perfil_biomecanico_frase  text,
  add column if not exists perfil_psicologico_frase  text,
  add column if not exists pontos_atencao            jsonb not null default '[]'::jsonb,
  add column if not exists concluida_em              timestamptz,
  add column if not exists notificado_equipe_em      timestamptz,
  add column if not exists notificacao_erro          text;

drop trigger if exists avaliacoes_iniciais_set_atualizado_em on public.avaliacoes_iniciais;
create trigger avaliacoes_iniciais_set_atualizado_em
  before update on public.avaliacoes_iniciais
  for each row execute function public.set_atualizado_em();

alter table public.avaliacoes_iniciais enable row level security;

-- Escopo sempre usuario_id = auth.uid() (§10.3, passo 2). Autosave de bloco
-- e leitura do próprio diagnóstico são "gravação/leitura do próprio
-- registro sem regra de negócio" — ficam no client via RLS, como o resto
-- do documento de arquitetura já define como padrão.
drop policy if exists "corredor le a propria avaliacao" on public.avaliacoes_iniciais;
create policy "corredor le a propria avaliacao"
  on public.avaliacoes_iniciais for select
  using (usuario_id = auth.uid());

drop policy if exists "corredor cria a propria avaliacao" on public.avaliacoes_iniciais;
create policy "corredor cria a propria avaliacao"
  on public.avaliacoes_iniciais for insert
  with check (usuario_id = auth.uid());

drop policy if exists "corredor atualiza a propria avaliacao" on public.avaliacoes_iniciais;
create policy "corredor atualiza a propria avaliacao"
  on public.avaliacoes_iniciais for update
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- Profissional recebe o diagnóstico por e-mail (RF06) — mesma decisão do
-- PRD §4 item 10: tela navegável no prontuário fica para quando o
-- prontuário do Fluxo de Fisioterapia existir. Sem policy de select para
-- eh_profissional() aqui de propósito, para não abrir uma leitura direta
-- que a arquitetura de produto ainda não desenhou como tela.

-- Sem policy de delete: nenhum fluxo do beta apaga uma avaliação pelo
-- client.

-- 2. Autosave atômico de bloco (RF03) -----------------------------------------
-- Sem esta função, o autosave exigiria ler o jsonb inteiro no client, mesclar
-- e regravar — sujeito a corrida entre duas abas da mesma sessão. A mesclagem
-- roda no banco, atomicamente, num único round-trip. security invoker
-- (padrão): a policy de insert/update de avaliacoes_iniciais continua valendo
-- para quem chama — a função não abre nenhum privilégio novo, só evita o
-- read-modify-write no client. create or replace já é idempotente por
-- natureza — sem guarda extra necessária aqui.
create or replace function public.salvar_bloco_avaliacao(p_chave text, p_valor jsonb)
returns public.avaliacoes_iniciais
language plpgsql
as $$
declare
  v_row public.avaliacoes_iniciais;
begin
  if p_chave not in ('blocoA','blocoB','blocoC','blocoD','blocoE','blocoF','blocoG','blocoH') then
    raise exception 'chave de bloco inválida: %', p_chave;
  end if;

  insert into public.avaliacoes_iniciais (usuario_id, respostas)
  values (auth.uid(), jsonb_build_object(p_chave, p_valor))
  on conflict (usuario_id) do update
    set respostas = avaliacoes_iniciais.respostas || jsonb_build_object(p_chave, p_valor)
  returning * into v_row;

  return v_row;
end;
$$;
