import { Eyebrow } from "@/components/ui/Eyebrow";
import { ZonaBadge } from "@/components/fisioterapia/ZonaBadge";
import { EstadoCardPainel } from "./EstadoCardPainel";
import { acaoPorZona, estadosPainel, eyebrowsPainel } from "@/lib/painel/copy";
import type { Resposta24h } from "@/lib/fisioterapia/types";
import type { ResultadoPainel } from "@/lib/painel/types";

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * RF03 — hero de status do dia. Sempre a resposta 24h mais recente, nunca
 * média nem valor em cache sem indicação de data (RF03-CA2). A adaptação é
 * aviso/gate: a "ação" orienta, a próxima sessão continua dependendo de
 * revisão do profissional (regra §6).
 */
export function HeroPainel({ resultado }: { resultado: ResultadoPainel<Resposta24h[]> }) {
  if (!resultado.ok) {
    return (
      <div className="rounded-2xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <Eyebrow dark>{eyebrowsPainel.hero}</Eyebrow>
        <div className="mt-4">
          <EstadoCardPainel erro />
        </div>
      </div>
    );
  }

  const maisRecente = resultado.data[0] ?? null;

  if (!maisRecente) {
    return (
      <div className="rounded-2xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <Eyebrow dark>{eyebrowsPainel.hero}</Eyebrow>
        <p className="mt-3 font-sans text-lg leading-relaxed text-white sm:text-xl">{estadosPainel.vazioHero}</p>
      </div>
    );
  }

  const acao = acaoPorZona[maisRecente.zona];

  return (
    <div className="rounded-2xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
      <Eyebrow dark>STATUS DE HOJE</Eyebrow>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <ZonaBadge zona={maisRecente.zona} />
        <span className="text-xs font-sans text-silver">Atualizado em {formatarData(maisRecente.criado_em)}</span>
      </div>
      {/* h2, não h1: a página já tem seu h1 ("Oi, {nome}") — dois h1 na
          mesma tela quebra a árvore de landmarks pra leitor de tela
          (auditoria de acessibilidade, 2026-09). */}
      <h2 className="mt-4 font-display text-3xl leading-tight text-white sm:text-4xl">{acao.label}</h2>
      <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-silver">{acao.frase}</p>
    </div>
  );
}
