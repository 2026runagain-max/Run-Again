-- Run Again — remoção de Medicina do Esporte da estratégia de produto.
-- PROPOSTA — revisar antes de aplicar (ver PR). Decisão de produto: o Run
-- Again não terá médico do esporte, ortopedista, nem qualquer avaliação
-- médica na equipe. Os pilares corretos, a partir de agora, são cinco:
-- Fisioterapia, Preparação Física, Nutrição Esportiva, Psicologia do
-- Esporte e Comunidade.
--
-- Por que isto NÃO recria o enum `especialidade_profissional` sem o valor
-- 'medicina_esporte':
--   1. 0001_fundacao.sql (onde o enum nasce) muito provavelmente já está
--      aplicado num ambiente real com dados — não deve ser editado
--      retroativamente (regra combinada com quem pediu esta tarefa).
--   2. PostgreSQL não tem `ALTER TYPE ... DROP VALUE`. Remover um valor de
--      verdade exige recriar o tipo inteiro (criar tipo novo sem o valor,
--      migrar cada coluna que usa o tipo com `USING`, apagar o tipo velho,
--      renomear o novo) — uma operação invasiva, que precisa primeiro
--      confirmar que nenhuma linha em `usuarios` ou `convites_profissional`
--      (e, se já aplicadas noutro ambiente, `atendimentos` e os posts de
--      comunidade que reaproveitam este enum) usa 'medicina_esporte' hoje.
--      Isso não pode ser decidido às cegas por quem não tem acesso ao
--      banco real — por isso esta migration não faz isso.
--
-- O que esta migration faz em vez disso: bloqueia, por CHECK constraint,
-- qualquer INSERT/UPDATE novo que tente gravar 'medicina_esporte' em
-- `usuarios.especialidade` ou `convites_profissional.especialidade`. Isso
-- já cumpre o objetivo de produto (ninguém consegue criar um profissional
-- ou convite de Medicina do Esporte a partir de agora) sem tocar no tipo
-- enum nem em nenhuma linha existente.
--
-- Se, depois de conferir o banco, ficar confirmado que nenhuma linha usa
-- 'medicina_esporte' em lugar nenhum, uma migration futura separada pode
-- então recriar o enum sem o valor — não é urgente e não é o que este
-- arquivo faz.

alter table public.usuarios
  add constraint usuarios_especialidade_nao_medicina_esporte
  check (especialidade is distinct from 'medicina_esporte');

alter table public.convites_profissional
  add constraint convites_profissional_especialidade_nao_medicina_esporte
  check (especialidade is distinct from 'medicina_esporte');
