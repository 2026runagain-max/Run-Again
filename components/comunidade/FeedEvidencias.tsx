import { EmptyState } from "@/components/estados/EmptyState";
import { PostEvidencia } from "./PostEvidencia";
import { comunidadeCopy } from "@/lib/comunidade/copy";
import type { PostFeedComunidade } from "@/lib/comunidade/types";

/** RF03.1 — feed cronológico; §8 — estado vazio explica por que ainda não há nada, não parece produto abandonado. */
export function FeedEvidencias({ posts, viewerId }: { posts: PostFeedComunidade[]; viewerId: string }) {
  if (posts.length === 0) {
    // Título próprio (não o default de EmptyState, "Ainda não tem nada por
    // aqui.") — o default repetiria quase literalmente o começo da frase
    // de §8 do PRD logo abaixo ("Ainda não há nada por aqui...").
    return <EmptyState titulo="Ainda sem posts" subtitulo={comunidadeCopy.vazioFeed} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostEvidencia key={post.id} post={post} souAutor={post.autor_id === viewerId} />
      ))}
    </ul>
  );
}
