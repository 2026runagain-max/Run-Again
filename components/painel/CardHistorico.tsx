import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EstadoCardPainel } from "./EstadoCardPainel";
import { estadosPainel, eyebrowsPainel } from "@/lib/painel/copy";
import { condicaoLabel } from "@/lib/fisioterapia/labels";
import type { HistoricoAtendimentoResumo, ResultadoPainel } from "@/lib/painel/types";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * RF08 — lista resumida de atendimentos, nunca os campos clínicos
 * completos (regra §6.9). Vem de vw_historico_atendimentos_corredor, já
 * restrita a data/status/condição.
 */
export function CardHistorico({ resultado }: { resultado: ResultadoPainel<HistoricoAtendimentoResumo[]> }) {
  return (
    <Card variant="pillar" className="flex flex-col gap-3">
      <Eyebrow>{eyebrowsPainel.historico}</Eyebrow>

      {!resultado.ok ? (
        <EstadoCardPainel erro />
      ) : resultado.data.length === 0 ? (
        <EstadoCardPainel texto={estadosPainel.vazioHistorico} />
      ) : (
        <ul className="flex flex-col gap-2">
          {resultado.data.slice(0, 3).map((a) => (
            <li key={a.id} className="flex items-center justify-between border-b border-mid/10 pb-2 text-sm font-sans last:border-0">
              <span className="text-ink">
                Atendimento concluído{a.condicao_principal ? ` — ${condicaoLabel[a.condicao_principal]}` : ""}
              </span>
              <span className="shrink-0 text-mid">{formatarData(a.finalizado_em ?? a.iniciado_em)}</span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/corredor/minha-recuperacao/historico"
        className="text-sm font-semibold font-sans text-fire-text hover:underline"
      >
        Ver histórico completo →
      </Link>
    </Card>
  );
}
