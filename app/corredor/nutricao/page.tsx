import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/estados/EmptyState";
import { GuiaAlimentacaoTreino } from "@/components/nutricao/GuiaAlimentacaoTreino";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";
import { getAvaliacaoNutricionalAtual, getOrientacaoVigente } from "@/lib/nutricao/queries";
import { estados } from "@/lib/nutricao/copy";
import { origemOrientacaoLabel } from "@/lib/nutricao/labels";

export const metadata: Metadata = { title: "Nutrição Esportiva — Run Again" };

export default async function NutricaoHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const avaliacaoFluxo2 = await getAvaliacaoAtual(user.id);
  if (!avaliacaoFluxo2?.concluida_em) {
    redirect("/corredor/painel");
  }

  const avaliacao = await getAvaliacaoNutricionalAtual(user.id);

  // RF01 — cai direto no questionário, não num painel vazio (§2.1, etapa 0).
  if (!avaliacao?.concluida_em) {
    const copy = avaliacao ? estados.vazioHubEmAndamento : estados.vazioHub;
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Eyebrow>NUTRIÇÃO ESPORTIVA</Eyebrow>
          <h1 className="mt-1 font-display text-3xl text-ink">Sua alimentação, sincronizada com seu treino</h1>
        </div>
        <EmptyState titulo={copy.titulo} subtitulo={copy.subtitulo} ctaLabel={copy.cta} ctaHref="/corredor/nutricao/avaliacao" />
      </div>
    );
  }

  // A mesma decisão de MinhaOrientacaoPage: o que mostrar segue a existência
  // de uma orientação real (calculada, ajustada ou definida pela equipe),
  // não só o nível bruto da triagem — um caso N4 já liberado pela equipe tem
  // uma orientação de verdade, mesmo a triagem automática tendo bloqueado.
  const orientacao = await getOrientacaoVigente(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>NUTRIÇÃO ESPORTIVA</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Sua alimentação, sincronizada com seu treino</h1>
      </div>

      <Link href="/corredor/nutricao/minha-orientacao">
        <Card variant="pillar" className="flex flex-col gap-2 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans font-bold uppercase tracking-wide text-fire-text">Minha orientação</p>
            {orientacao && <Badge>{origemOrientacaoLabel[orientacao.origem].toUpperCase()}</Badge>}
          </div>
          <h2 className="font-display text-2xl text-ink">
            {orientacao ? "Ver sua energia, macros, timing e hidratação" : "Ver sua orientação geral"}
          </h2>
          <p className="text-sm font-sans text-mid">
            {orientacao
              ? "Calculada pra sua semana de treino, sempre com explicação ao lado."
              : "Sua avaliação está com a equipe — enquanto isso, uma orientação geral já está disponível."}
          </p>
        </Card>
      </Link>

      <GuiaAlimentacaoTreino />

      <Link
        href="/corredor/nutricao/registro"
        className="text-sm font-semibold font-sans text-fire-text hover:underline"
      >
        Ver meu registro alimentar →
      </Link>
    </div>
  );
}
