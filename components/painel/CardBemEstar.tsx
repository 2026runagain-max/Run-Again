import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ZonaBadge } from "@/components/fisioterapia/ZonaBadge";
import { bemEstarCaption, bemEstarCaptionAtualizado, eyebrowsPainel } from "@/lib/painel/copy";
import type { ZonaResposta } from "@/lib/fisioterapia/types";

/**
 * RF07 (Painel) / RF-7 (Psicologia do Esporte) — antes do primeiro check-in
 * periódico, snapshot estático do perfil psicológico do diagnóstico
 * (RF07-CA1 do painel). A partir do primeiro check-in de Psicologia do
 * Esporte, passa a mostrar a zona + frase mais recente
 * (lib/psicologia/queries.ts, getResumoBemEstar) — RF-7-CA1/CA2: mesma
 * posição, tamanho e formato do card, só o conteúdo ativado.
 *
 * variant="pillar", igual aos outros 3 cards da grade (não mais "insight"/
 * fire-dim): auditoria de design — o tingimento estava alocado por posição
 * ("este é o 4º card"), não por relevância. Risco e carga/forma em estado
 * de atenção são, no mínimo, tão notáveis quanto este; um grid de leituras
 * em pé de igualdade precisa do mesmo contêiner pra ler como um conjunto,
 * não destacar um card por acaso de onde ele mora no grid.
 */
export function CardBemEstar({
  frase,
  zona,
  ehLeituraInicial = true,
}: {
  frase: string;
  zona?: ZonaResposta | null;
  ehLeituraInicial?: boolean;
}) {
  return (
    <Card variant="pillar" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{eyebrowsPainel.bemEstar}</Eyebrow>
        {zona && <ZonaBadge zona={zona} />}
      </div>
      <p className="font-sans text-sm leading-relaxed text-ink">{frase}</p>
      <p className="text-xs font-sans text-mid">{ehLeituraInicial ? bemEstarCaption : bemEstarCaptionAtualizado}</p>
    </Card>
  );
}
