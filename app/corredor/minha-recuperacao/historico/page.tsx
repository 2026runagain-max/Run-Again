import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/estados/EmptyState";
import { getHistoricoAtendimentosCorredor, getPerfilCorredorPrescricao } from "@/lib/fisioterapia/queries";

export const metadata: Metadata = { title: "Histórico — Run Again" };

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function HistoricoPage() {
  const perfil = await getPerfilCorredorPrescricao();
  if (!perfil) return null;

  const atendimentos = await getHistoricoAtendimentosCorredor(perfil.id);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          HISTÓRICO
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Atendimentos</h1>
      </div>

      {atendimentos.length === 0 ? (
        <EmptyState
          titulo="Ainda não há atendimento concluído."
          subtitulo="Assim que um for finalizado, ele aparece aqui."
        />
      ) : (
        <Card variant="pillar">
          <ul className="flex flex-col gap-3">
            {atendimentos.map((a) => (
              <li key={a.id} className="flex items-center justify-between border-b border-mid/10 py-2 text-sm font-sans last:border-0">
                <span className="text-ink">Atendimento concluído</span>
                <span className="text-mid">{a.finalizado_em ? formatarData(a.finalizado_em) : formatarData(a.iniciado_em)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
