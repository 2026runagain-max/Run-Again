-- Auditoria de segurança pré-lançamento (2026-09) — CRÍTICO, correção de
-- 0012_endurecer_funcoes_convite.sql.
--
-- Verifiquei direto contra o banco real, depois da 0012 já aplicada, e a
-- chamada anônima a consumir_convite_beta continuava funcionando — a
-- correção não tinha funcionado. Causa: neste projeto Supabase, o papel
-- `anon` (e `authenticated`) recebe EXECUTE em toda função nova por uma
-- concessão PRÓPRIA, direta — não só por herdar do papel PUBLIC. Um
-- "revoke ... from public" tira o que vem de PUBLIC, mas não risca essa
-- concessão direta de `anon`/`authenticated` — por isso a 0012 (que só
-- revogava de public) não bloqueou nada de verdade.
--
-- Testando as outras 5 funções que já tinham esse mesmo padrão
-- ("revoke ... from public" sozinho, sem citar anon/authenticated —
-- marcar_exercicio_concluido, corredor_tem_caso_aberto,
-- marcar_checkins_psicologia_revisados, excluir_post_comunidade,
-- excluir_resposta_comunidade), confirmei que TODAS as 5 também continuam
-- respondendo pra uma chamada sem sessão nenhuma — o mesmo problema já
-- existia no projeto antes desta auditoria, só que sem consequência
-- prática até agora porque as 5 verificam eh_corredor()/eh_profissional()
-- ou dono da linha por dentro (auth.uid() vem nulo pra quem não está
-- logado, então a checagem interna já barra mesmo com a permissão de banco
-- aberta). Já as 3 funções de convite (consumir_convite_beta,
-- liberar_convite_beta, consumir_convite_profissional) NÃO têm nenhuma
-- checagem interna — são feitas pra rodar antes de existir login — então
-- pra elas a falha de revoke era a única defesa, e continuava aberta na
-- prática até esta migration.
--
-- Fix: revoga EXECUTE explicitamente de anon e authenticated (além de
-- public, por completude) nas 8 funções — as 3 críticas e as 5 já
-- "corrigidas" antes, agora corrigidas de verdade. Onde a função precisa
-- continuar acessível por quem está logado, o grant a "authenticated" é
-- refeito logo em seguida, igual já estava.

revoke all on function public.consumir_convite_beta(text) from public, anon, authenticated;
revoke all on function public.liberar_convite_beta(text) from public, anon, authenticated;
revoke all on function public.consumir_convite_profissional(uuid) from public, anon, authenticated;

revoke all on function public.marcar_exercicio_concluido(uuid, boolean) from public, anon, authenticated;
grant execute on function public.marcar_exercicio_concluido(uuid, boolean) to authenticated;

revoke all on function public.corredor_tem_caso_aberto(caso_nutricao_tipo) from public, anon, authenticated;
grant execute on function public.corredor_tem_caso_aberto(caso_nutricao_tipo) to authenticated;

revoke all on function public.marcar_checkins_psicologia_revisados(uuid) from public, anon, authenticated;
grant execute on function public.marcar_checkins_psicologia_revisados(uuid) to authenticated;

revoke all on function public.excluir_post_comunidade(uuid) from public, anon, authenticated;
grant execute on function public.excluir_post_comunidade(uuid) to authenticated;

revoke all on function public.excluir_resposta_comunidade(uuid) from public, anon, authenticated;
grant execute on function public.excluir_resposta_comunidade(uuid) to authenticated;
