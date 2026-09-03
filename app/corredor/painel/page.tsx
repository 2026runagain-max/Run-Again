import type { Metadata } from "next";
import { EmptyState } from "@/components/estados/EmptyState";
import { getSessao } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Painel — Run Again" };

export default async function PainelCorredorPage() {
  const sessao = await getSessao();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          ÁREA DO CORREDOR
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          Oi, {sessao?.nome.split(" ")[0]}.
        </h1>
      </div>

      <EmptyState subtitulo="Os pilares clínicos — fisioterapia, preparo físico, nutrição, medicina e psicologia do esporte — chegam nos próximos passos. Sua vaga de beta está confirmada: 90 dias pra usar o Run Again do jeito que ele foi pensado pra você." />
    </div>
  );
}
