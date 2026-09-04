import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { copyPilarChegando, OUTROS_PILARES } from "@/lib/painel/copy";

/**
 * RF09 — um espaço nomeado por pilar do ecossistema, Fisioterapia como
 * único ativo. Placeholders nunca vazios sem explicação, nunca com data
 * prometida (regra §6.6).
 *
 * Auditoria de design (2026-09): a versão anterior repetia o mesmo card
 * grande e o mesmo parágrafo 4 vezes seguidas — a leitura ficava idêntica a
 * um roadmap genérico de SaaS ("em breve" x4), e o bloco competia em peso
 * visual com os cards de dado real acima, mesmo sem ter dado nenhum. Agora:
 * o parágrafo aparece uma vez, e cada pilar inativo é uma linha compacta
 * com borda tracejada — o traço em si já diz "isto ainda não é um card de
 * verdade", sem precisar de opacidade (que achatava o contraste do texto
 * abaixo do mínimo de acessibilidade). RF09-CA2 continua respeitado: cada
 * pilar mantém seu próprio espaço nomeado, e trocar um por um card ativo
 * no futuro não desloca os demais.
 */
export function GradePilares() {
  return (
    <div>
      <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">Seus pilares</p>

      <Link href="/corredor/minha-recuperacao" className="mt-3 block">
        <Card variant="pillar" className="flex flex-col gap-2 transition-shadow hover:shadow-md">
          <Badge>ATIVO</Badge>
          <h3 className="font-display text-2xl text-ink">Fisioterapia</h3>
          <p className="text-sm font-sans text-mid">Seu protocolo, sessão de hoje e evolução.</p>
        </Card>
      </Link>

      <p className="mt-4 text-sm font-sans text-mid">{copyPilarChegando}</p>

      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OUTROS_PILARES.map((pilar) => (
          <li
            key={pilar.nome}
            className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-mid/35 px-4 py-3"
          >
            <span className="font-sans text-sm font-semibold text-ink">{pilar.nome}</span>
            <span className="shrink-0 text-[10px] font-bold font-sans uppercase tracking-[0.14em] text-mid">
              Em construção
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
