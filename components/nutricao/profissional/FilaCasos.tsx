import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/estados/EmptyState";
import { labelPersona } from "@/lib/labels";
import { casoStatusLabel } from "@/lib/nutricao/labels";
import type { CasoNutricaoComPaciente } from "@/lib/nutricao/types";
import type { Persona } from "@/lib/types";
import { AssumirCasoButton } from "./AssumirCasoButton";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function FilaCasos({ casos, vazio }: { casos: CasoNutricaoComPaciente[]; vazio: string }) {
  if (casos.length === 0) {
    return <EmptyState subtitulo={vazio} />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {casos.map((caso) => (
        <li key={caso.id} className="rounded-2xl border border-mid/15 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/profissional/pacientes/${caso.paciente.id}/nutricao?casoId=${caso.id}`} className="font-sans text-base font-bold text-ink hover:underline">
                  {caso.paciente.nome}
                </Link>
                <Badge>{casoStatusLabel[caso.status].toUpperCase()}</Badge>
              </div>
              {caso.paciente.persona && (
                <p className="text-xs font-sans uppercase tracking-wide text-mid">{labelPersona[caso.paciente.persona as Persona]}</p>
              )}
              <p className="mt-1 text-sm font-sans text-ink">{caso.motivo}</p>
              <p className="mt-1 text-xs font-sans text-mid">Aberto em {formatarData(caso.criado_em)}</p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              {caso.status === "aberto" && <AssumirCasoButton casoId={caso.id} />}
              <Link
                href={`/profissional/pacientes/${caso.paciente.id}/nutricao?casoId=${caso.id}`}
                className="text-sm font-semibold font-sans text-fire-text hover:underline"
              >
                Abrir caso →
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
