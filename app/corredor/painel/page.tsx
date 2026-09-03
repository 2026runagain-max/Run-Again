import type { Metadata } from "next";
import { EmptyState } from "@/components/estados/EmptyState";
import { getSessao } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Painel — Run Again" };

export default async function PainelCorredorPage() {
  const sessao = await getSessao();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire">
          ÁREA DO CORREDOR
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          Oi, {sessao?.nome.split(" ")[0]}.
        </h1>
      </div>

      <EmptyState subtitulo="Os pilares — fisioterapia, preparo físico, nutrição, medicina e psicologia do esporte — chegam nos próximos fluxos. Sua conta já está pronta pra quando eles chegarem." />
    </div>
  );
}
