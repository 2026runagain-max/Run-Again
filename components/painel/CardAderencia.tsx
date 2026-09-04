import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EstadoCardPainel } from "./EstadoCardPainel";
import { aderenciaFrasePorFaixa, estadosPainel, eyebrowsPainel } from "@/lib/painel/copy";
import type { AderenciaResumo, ResultadoPainel } from "@/lib/painel/types";

/**
 * RF04 — % nunca isolado (regra §6.1): sempre acompanhado da frase abaixo,
 * e nunca comparado com outro corredor.
 */
export function CardAderencia({ resultado }: { resultado: ResultadoPainel<AderenciaResumo | null> }) {
  return (
    <Card variant="pillar" className="flex flex-col gap-3">
      <Eyebrow>{eyebrowsPainel.aderencia}</Eyebrow>

      {!resultado.ok ? (
        <EstadoCardPainel erro />
      ) : !resultado.data ? (
        <EstadoCardPainel texto={estadosPainel.vazioAderencia} />
      ) : (
        <>
          <p className="font-display text-5xl leading-none text-ink">
            {resultado.data.percentual}%
            <span className="ml-2 font-sans text-sm font-normal text-mid">
              {resultado.data.concluidos} de {resultado.data.prescritos} exercícios
            </span>
          </p>
          <p className="font-sans text-sm leading-relaxed text-mid">
            {aderenciaFrasePorFaixa(resultado.data.percentual)}
          </p>
        </>
      )}

      <Link href="/corredor/minha-recuperacao/sessao" className="text-sm font-semibold font-sans text-fire-text hover:underline">
        Ver sessão de hoje →
      </Link>
    </Card>
  );
}
