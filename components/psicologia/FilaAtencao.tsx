import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/estados/EmptyState";
import { ZonaBadge } from "@/components/fisioterapia/ZonaBadge";
import { labelPersona } from "@/lib/labels";
import { profissionalCopy } from "@/lib/psicologia/copy";
import type { FilaAtencaoItem } from "@/lib/psicologia/types";
import type { Persona } from "@/lib/types";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function Linha({ item }: { item: FilaAtencaoItem }) {
  return (
    <li className="rounded-2xl border border-mid/15 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profissional/pacientes/${item.pacienteId}/psicologia`}
              className="font-sans text-base font-bold text-ink hover:underline"
            >
              {item.nome}
            </Link>
            {item.temTextoLivreNaoRevisado && <Badge>TEXTO LIVRE NÃO REVISADO</Badge>}
            {item.zonaAtual && <ZonaBadge zona={item.zonaAtual} />}
            {!item.zonaAtual && (
              <span className="text-xs font-sans uppercase tracking-wide text-mid">Sem check-in ainda</span>
            )}
          </div>
          {item.persona && (
            <p className="mt-1 text-xs font-sans uppercase tracking-wide text-mid">
              {labelPersona[item.persona as Persona]}
            </p>
          )}
          <p className="mt-1 text-xs font-sans text-mid">
            {item.ultimoCheckinEm
              ? `Último check-in em ${formatarData(item.ultimoCheckinEm)}`
              : "Ainda não respondeu a nenhum check-in periódico."}
            {item.cadencia?.emAtraso && " · em atraso em relação à cadência esperada"}
          </p>
        </div>

        <Link
          href={`/profissional/pacientes/${item.pacienteId}/psicologia`}
          className="shrink-0 text-sm font-semibold font-sans text-fire-text hover:underline"
        >
          Abrir prontuário →
        </Link>
      </div>
    </li>
  );
}

/**
 * RF-4 — hub do painel do psicólogo: lista priorizada por zona + sinais de
 * texto livre (RF-4.1). Corredores tranquilos (zona verde, sem atraso,
 * sem texto pendente) continuam listados — RF-4.1 exige "todos os
 * corredores" — mas em uma seção separada e discreta, pra que o estado
 * vazio (§8: "nenhum sinal pendente agora") continue significando o que a
 * copy promete: ninguém está esperando pelo psicólogo agora.
 */
export function FilaAtencao({ itens }: { itens: FilaAtencaoItem[] }) {
  const pendentes = itens.filter(
    (i) => i.temTextoLivreNaoRevisado || i.zonaAtual === "vermelha" || i.zonaAtual === "amarela" || i.cadencia?.emAtraso,
  );
  const tranquilos = itens.filter((i) => !pendentes.includes(i));

  return (
    <div className="flex flex-col gap-6">
      {pendentes.length === 0 ? (
        <EmptyState subtitulo={profissionalCopy.vazioFila} />
      ) : (
        <ul className="flex flex-col gap-3">
          {pendentes.map((item) => (
            <Linha key={item.pacienteId} item={item} />
          ))}
        </ul>
      )}

      {tranquilos.length > 0 && (
        <details className="rounded-2xl border border-dashed border-mid/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold font-sans text-mid">
            {profissionalCopy.secaoTranquilos} ({tranquilos.length})
          </summary>
          <ul className="mt-3 flex flex-col gap-3">
            {tranquilos.map((item) => (
              <Linha key={item.pacienteId} item={item} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
