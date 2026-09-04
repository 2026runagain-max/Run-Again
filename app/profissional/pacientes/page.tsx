import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/estados/EmptyState";
import { buscarPacientes } from "@/lib/fisioterapia/queries";
import { labelPersona } from "@/lib/labels";
import { profissionalCopy } from "@/lib/fisioterapia/copy";
import type { Persona } from "@/lib/types";

export const metadata: Metadata = { title: "Pacientes — Run Again" };

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const pacientes = await buscarPacientes(q ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          PRESCRIÇÃO CLÍNICA
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Pacientes</h1>
      </div>

      <form method="GET" className="flex gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Busca por nome do corredor"
          className="w-full max-w-sm rounded-lg border border-mid/40 bg-white px-4 py-2.5 text-sm font-sans text-ink placeholder:text-mid/70 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/30"
        />
        <button
          type="submit"
          className="rounded-full bg-fire px-6 py-2.5 text-sm font-semibold font-sans text-white transition-colors hover:bg-fire/90"
        >
          Buscar
        </button>
      </form>

      {pacientes.length === 0 ? (
        <EmptyState titulo="Nenhum paciente por aqui ainda." subtitulo={profissionalCopy.vazioPacientes} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pacientes.map((p) => (
            <Link key={p.id} href={`/profissional/pacientes/${p.id}`}>
              <Card variant="pillar" className="flex flex-col gap-2 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <p className="font-sans text-base font-bold text-ink">{p.nome}</p>
                  {p.atendimento_aberto_id && <Badge>ATENDIMENTO ABERTO</Badge>}
                </div>
                {p.persona && (
                  <p className="text-xs font-sans uppercase tracking-wide text-mid">
                    {labelPersona[p.persona as Persona]}
                  </p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
