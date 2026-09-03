-- Run Again — Protocolo Integrado e Dashboard de Progresso (/corredor/painel)
-- Estende 0001_fundacao.sql, 0002_fisioterapia_prescricao.sql e
-- 0004_avaliacao_inicial.sql. Não repete nem recria nada de lá.
--
-- Fonte: PRD de arquitetura de produto "Protocolo Integrado e Dashboard de
-- Progresso" (§5, §6, §10). Implementa RF02 (conclusão por exercício), RF10
-- (flag de onboarding do painel), a leitura do diagnóstico pelo profissional
-- que RF01 depende (0004 deixou isso pendente de propósito) e a decisão de
-- RLS pendente de RF08 (histórico de sessões pro corredor). RF03–RF09 usam
-- só dado que já existia antes desta migração.
--
-- Escrita pra ser seguramente re-executável, mesma convenção de
-- 0004_avaliacao_inicial.sql.

-- 0. Onboarding do painel (RF10) ----------------------------------------------
-- Flag própria, não reaproveita corredor_viu_onboarding_prescricao (RF10.1).

alter table public.usuarios
  add column if not exists corredor_viu_onboarding_painel boolean not null default false;

-- 1. Conclusão por exercício (RF02) --------------------------------------------
-- Granularidade de exercício, não de sessão inteira (regra §6: "fiz metade" é
-- uma resposta real que um sim/não por sessão esconderia). concluido_em
-- existe pra permitir, no futuro, aderência por período real (não só
-- contagem) sem migração nova.

alter table public.sessao_exercicios
  add column if not exists concluido_pelo_corredor boolean not null default false,
  add column if not exists concluido_em timestamptz;

-- Sem policy de UPDATE nova em sessao_exercicios pro corredor: um UPDATE de
-- linha inteira liberaria series/repeticoes/carga_ou_tempo/exercicio_id pro
-- client editar também, o que não é RF02 (RF02 é só o estado de conclusão).
-- Em vez disso, a única porta de escrita do corredor é esta função, que roda
-- como o dono da migração (bypassa RLS de propósito) e só toca as duas
-- colunas de conclusão — o mesmo raciocínio de "escopo de escrita mínimo"
-- já registrado no comentário de calcular_zona_resposta (0002).
create or replace function public.marcar_exercicio_concluido(
  p_sessao_exercicio_id uuid,
  p_concluido boolean
)
returns public.sessao_exercicios
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.sessao_exercicios;
begin
  update public.sessao_exercicios se
  set
    concluido_pelo_corredor = p_concluido,
    concluido_em = case when p_concluido then now() else null end
  from public.sessoes_prescritas s
  where se.id = p_sessao_exercicio_id
    and se.sessao_id = s.id
    and s.paciente_id = auth.uid()
    and s.visivel_para_corredor = true
  returning se.* into v_row;

  if v_row.id is null then
    raise exception 'exercício não encontrado ou sem permissão para marcar conclusão';
  end if;

  return v_row;
end;
$$;

-- Roda com o privilégio de quem chama, exceto pelo bypass de RLS do
-- search_path acima: revoga de PUBLIC e concede só a authenticated, mesma
-- postura de "authenticated" usada em todo o resto do schema (sem role
-- anônima participando de nenhum fluxo autenticado).
revoke all on function public.marcar_exercicio_concluido(uuid, boolean) from public;
grant execute on function public.marcar_exercicio_concluido(uuid, boolean) to authenticated;

-- 2. Leitura do diagnóstico pelo profissional (RF01) --------------------------
-- 0004_avaliacao_inicial.sql deixou isto em aberto de propósito: "sem policy
-- de select para eh_profissional() aqui, pra não abrir uma leitura direta
-- que a arquitetura de produto ainda não desenhou como tela". Esta migração
-- é exatamente essa tela (RF01 — pré-preenchimento da avaliação clínica a
-- partir do diagnóstico), então a policy entra agora, não antes.

drop policy if exists "profissional le avaliacao de qualquer paciente" on public.avaliacoes_iniciais;
create policy "profissional le avaliacao de qualquer paciente"
  on public.avaliacoes_iniciais for select
  using (public.eh_profissional());

-- 3. Histórico de sessões com profissionais — decisão de RLS (RF08-CA1) -------
-- Estado anterior: "profissional le todos atendimentos" (0002) liberava
-- select de TODAS as colunas — inclusive queixa_principal/historico_
-- subjetivo/observacoes_objetivas, texto clínico livre — pra paciente_id =
-- auth.uid(). Funcionava porque nenhuma tela de corredor lia a tabela direto
-- (só via lib/fisioterapia/queries.ts, que já escolhia colunas seguras), mas
-- a policy em si permitia a qualquer client autenticado pedir queixa_
-- principal da própria linha via REST — exatamente a "abertura total da
-- tabela" que a regra §6.9 do PRD de painel proíbe. Corrigido abaixo:
-- corredor perde acesso direto à tabela e passa a ler só por uma view
-- restrita a campos de resumo.

drop policy if exists "profissional le todos atendimentos" on public.atendimentos;
drop policy if exists "profissional le atendimentos" on public.atendimentos;

create policy "profissional le atendimentos"
  on public.atendimentos for select
  using (public.eh_profissional());

-- View deliberadamente SEM security_invoker (ao contrário de vw_evolucao_
-- testes etc.): ela mesma é o mecanismo de restrição de linha (where
-- paciente_id = auth.uid()) e de coluna (lista de select não inclui nenhum
-- campo clínico narrativo) — não delega pra RLS da tabela base, que agora
-- nem tem mais policy de select pro corredor. Isso é intencional: RLS
-- restringe linha, não coluna: pra restringir coluna também, a view precisa
-- rodar com o privilégio de quem a criou (dono do schema), e ela própria
-- vira a única porta de leitura do corredor pra esta tabela.
create or replace view public.vw_historico_atendimentos_corredor as
select
  id,
  status,
  condicao_principal,
  iniciado_em,
  finalizado_em
from public.atendimentos
where paciente_id = auth.uid();
