import type { Metadata } from "next";
import { EmptyState } from "@/components/estados/EmptyState";
import { getSessao } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Painel — Run Again" };

export default async function PainelProfissionalPage() {
  const sessao = await getSessao();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire">
          EQUIPE RUN AGAIN
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          Oi, {sessao?.nome.split(" ")[0]}.
        </h1>
      </div>

      <EmptyState subtitulo="Os fluxos clínicos — avaliação, protocolo, acompanhamento — chegam nos próximos passos. Sua conta já está ativa e pronta." />
    </div>
  );
}
