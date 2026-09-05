import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OnboardingPrescricao } from "@/components/fisioterapia/OnboardingPrescricao";
import { getPerfilCorredorPrescricao, getSessaoVisivelMaisRecente } from "@/lib/fisioterapia/queries";
import { corredorCopy } from "@/lib/fisioterapia/copy";

export const metadata: Metadata = { title: "Treinos Recomendados — Run Again" };

export default async function MinhaRecuperacaoPage() {
  const perfil = await getPerfilCorredorPrescricao();
  if (!perfil) return null;

  if (!perfil.viuOnboarding) {
    return <OnboardingPrescricao />;
  }

  const sessao = await getSessaoVisivelMaisRecente(perfil.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          TREINOS RECOMENDADOS
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">Treinos recomendados</h1>
      </div>

      {!sessao ? (
        <Card variant="pillar" className="p-8 text-center">
          <h2 className="font-display text-2xl text-ink">Sua sessão ainda está sendo desenhada.</h2>
          <p className="mt-2 font-sans text-sm text-mid">{corredorCopy.vazioSemSessao}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/corredor/minha-recuperacao/sessao">
            <Card variant="pillar" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-md">
              <p className="text-xs font-sans font-bold uppercase tracking-wide text-fire-text">Sessão de hoje</p>
              <h2 className="font-display text-2xl text-ink">O que treinar hoje</h2>
              <p className="text-sm font-sans text-mid">
                Montada a partir do que você sentiu na última avaliação — não de uma tabela genérica.
              </p>
            </Card>
          </Link>

          <Link href="/corredor/minha-recuperacao/evolucao">
            <Card variant="pillar" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-md">
              <p className="text-xs font-sans font-bold uppercase tracking-wide text-fire-text">Minha evolução</p>
              <h2 className="font-display text-2xl text-ink">O que já mudou</h2>
              <p className="text-sm font-sans text-mid">
                A prova, em número, de que voltar a treinar forte não é exagero.
              </p>
            </Card>
          </Link>
        </div>
      )}

      <Link href="/corredor/minha-recuperacao/historico" className="text-sm font-semibold font-sans text-fire-text hover:underline">
        Ver histórico de atendimentos →
      </Link>
    </div>
  );
}
