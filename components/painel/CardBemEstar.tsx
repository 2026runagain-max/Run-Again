import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { bemEstarCaption, eyebrowsPainel } from "@/lib/painel/copy";

/**
 * RF07 — snapshot estático do perfil psicológico do diagnóstico (RF07-CA1:
 * nunca recalculado automaticamente nesta versão). Sem rótulo clínico —
 * só a frase que o diagnóstico já produziu (lib/avaliacao/diagnostico.ts,
 * calcularPerfilPsicologico).
 *
 * variant="pillar", igual aos outros 3 cards da grade (não mais "insight"/
 * fire-dim): auditoria de design — o tingimento estava alocado por posição
 * ("este é o 4º card"), não por relevância. Risco e carga/forma em estado
 * de atenção são, no mínimo, tão notáveis quanto este; um grid de leituras
 * em pé de igualdade precisa do mesmo contêiner pra ler como um conjunto,
 * não destacar um card por acaso de onde ele mora no grid.
 */
export function CardBemEstar({ frase }: { frase: string }) {
  return (
    <Card variant="pillar" className="flex flex-col gap-3">
      <Eyebrow>{eyebrowsPainel.bemEstar}</Eyebrow>
      <p className="font-sans text-sm leading-relaxed text-ink">{frase}</p>
      <p className="text-xs font-sans text-mid">{bemEstarCaption}</p>
    </Card>
  );
}
