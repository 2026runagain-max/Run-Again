import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EstadoCardPainel } from "./EstadoCardPainel";
import { RodapeAcoesCartao } from "./RodapeAcoesCartao";
import { CompartilharEvidenciaButton } from "@/components/comunidade/CompartilharEvidenciaButton";
import { aderenciaFrasePorFaixa, estadosPainel, eyebrowsPainel } from "@/lib/painel/copy";
import type { AderenciaResumo, ResultadoPainel } from "@/lib/painel/types";
import type { ElegibilidadeCompartilhar } from "@/lib/comunidade/types";

/**
 * RF04 — % nunca isolado (regra §6.1): sempre acompanhado da frase abaixo,
 * e nunca comparado com outro corredor.
 *
 * `compartilhar` — RF01 da Comunidade (ver nota em CardRisco.tsx).
 */
export function CardAderencia({
  resultado,
  compartilhar,
}: {
  resultado: ResultadoPainel<AderenciaResumo | null>;
  compartilhar?: ElegibilidadeCompartilhar | null;
}) {
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

      <RodapeAcoesCartao>
        <Link href="/corredor/minha-recuperacao/sessao" className="text-sm font-semibold font-sans text-fire-text hover:underline">
          Ver sessão de hoje →
        </Link>
        {compartilhar && (
          <CompartilharEvidenciaButton
            tipoEvidencia="aderencia"
            chave={compartilhar.chave}
            textoEvidencia={compartilhar.textoEvidencia}
          />
        )}
      </RodapeAcoesCartao>
    </Card>
  );
}
