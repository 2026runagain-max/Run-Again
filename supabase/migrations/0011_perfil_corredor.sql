-- Run Again — Edição de perfil do corredor (feedback da Marina, 2026-09).
-- Estende 0001_fundacao.sql. Sem integração de API com Instagram/Strava
-- nesta fase — só guarda e exibe o link, como pedido explicitamente na
-- tarefa (nada de OAuth/API dessas plataformas aqui).

alter table public.usuarios
  add column instagram text,
  add column strava    text,
  add column foto_url  text;

-- Bucket de fotos de perfil. Público pra leitura (é assim que o header e
-- qualquer outro lugar que mostrar o avatar carregam a imagem) — só o
-- dono da própria pasta (primeiro segmento do caminho = seu próprio
-- auth.uid()) pode gravar, atualizar ou remover.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar publico pra leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "usuario envia sua propria foto"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "usuario atualiza sua propria foto"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "usuario remove sua propria foto"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
