import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FilaAtencao } from "@/components/psicologia/FilaAtencao";
import { getFilaAtencao } from "@/lib/psicologia/queries";

export const metadata: Metadata = { title: "Fila de Atenção — Run Again" };

/**
 * RF-4 — hub do painel do psicólogo: a tela inicial é a fila de atenção,
 * não uma lista alfabética. Rota real: /profissional/psicologia/fila — o
 * PRD descreve /psicologia/fila (sem o prefixo /profissional), mas este
 * repositório nunca adotou o route-group (profissional) que tornaria isso
 * literal (ver AGENTS.md/arquitetura técnica global — aqui "profissional" é
 * um segmento de URL de verdade, igual a /profissional/nutricao/casos).
 * Mantido consistente com o resto do produto em vez do literal do PRD.
 */
export default async function FilaAtencaoPage() {
  const itens = await getFilaAtencao();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>PSICOLOGIA DO ESPORTE</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Fila de atenção</h1>
        <p className="mt-1 text-sm font-sans text-mid">
          Ordenada por quem precisa de você primeiro — texto livre não revisado, depois zona vermelha, amarela e
          atraso na cadência.
        </p>
      </div>

      <FilaAtencao itens={itens} />
    </div>
  );
}
