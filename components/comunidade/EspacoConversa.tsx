import { EmptyState } from "@/components/estados/EmptyState";
import { CriarTopicoForm } from "./CriarTopicoForm";
import { TopicoConversa } from "./TopicoConversa";
import { comunidadeCopy } from "@/lib/comunidade/copy";
import type { TopicoComunidade } from "@/lib/comunidade/types";

/** RF06/RF07 — mural de conversa: formulário de novo tópico sempre visível, tópicos abaixo. */
export function EspacoConversa({ topicos, viewerId }: { topicos: TopicoComunidade[]; viewerId: string }) {
  return (
    <div className="flex flex-col gap-4">
      <CriarTopicoForm />

      {topicos.length === 0 ? (
        // Mesmo motivo do título próprio em FeedEvidencias.tsx — evita
        // repetir "ainda não há... por aqui" duas vezes seguidas.
        <EmptyState titulo="Ainda sem conversas" subtitulo={comunidadeCopy.vazioConversa} />
      ) : (
        <ul className="flex flex-col gap-3">
          {topicos.map((topico) => (
            <TopicoConversa key={topico.id} topico={topico} viewerId={viewerId} />
          ))}
        </ul>
      )}
    </div>
  );
}
