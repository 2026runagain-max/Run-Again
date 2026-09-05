import { Card } from "@/components/ui/Card";
import { CONTEUDO_EDUCATIVO_GERAL, estados } from "@/lib/nutricao/copy";

/**
 * RF13/RF04-CA3 — N4 (bloqueado por segurança) e N2 (dado insuficiente)
 * compartilham o mesmo conteúdo genérico (RF13-CA2), nunca um número
 * individualizado. `comAvisoSeguranca` diferencia só a moldura de cima
 * (§8: "estado especial, nunca tratado como erro") — o banco de conteúdo é
 * idêntico.
 */
export function EstadoEducativo({ comAvisoSeguranca }: { comAvisoSeguranca: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      {comAvisoSeguranca && (
        <Card variant="insight" className="flex flex-col gap-2">
          <h2 className="font-display text-2xl text-ink">{estados.estadoN4.titulo}</h2>
          <p className="text-sm font-sans text-mid">{estados.estadoN4.subtitulo}</p>
        </Card>
      )}

      <div>
        <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Enquanto isso</p>
        <h2 className="mt-1 font-display text-2xl text-ink">Uma orientação geral pra você começar</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONTEUDO_EDUCATIVO_GERAL.map((item) => (
          <Card key={item.titulo} variant="pillar" className="flex flex-col gap-2">
            <h3 className="font-sans text-base font-bold text-ink">{item.titulo}</h3>
            <p className="text-sm font-sans text-mid">{item.texto}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
