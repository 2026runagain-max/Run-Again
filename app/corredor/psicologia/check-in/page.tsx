import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/estados/EmptyState";
import { OnboardingPsicologia } from "@/components/psicologia/OnboardingPsicologia";
import { CheckinPsicologiaForm } from "@/components/psicologia/CheckinPsicologiaForm";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";
import { getCadenciaCorredor, getPerfilPsicologia } from "@/lib/psicologia/queries";
import { corredorCopy, NOME_PSICOLOGO_PADRAO } from "@/lib/psicologia/copy";

export const metadata: Metadata = { title: "Check-in — Psicologia do Esporte — Run Again" };

export default async function CheckinPsicologiaPage({
  searchParams,
}: {
  searchParams: Promise<{ agora?: string }>;
}) {
  const { agora } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RF-1.1 — elegível só com o perfil psicológico inicial (Bloco E, Fluxo 2)
  // já existindo. Sem diagnóstico concluído, não há check-in "zero" pra
  // comparar (RF-2-CA1).
  const avaliacao = await getAvaliacaoAtual(user.id);
  if (!avaliacao?.concluida_em) {
    return (
      <div className="flex flex-col gap-6">
        <Eyebrow>PSICOLOGIA DO ESPORTE</Eyebrow>
        <EmptyState
          titulo={corredorCopy.vazioSemElegibilidadeTitulo}
          subtitulo={corredorCopy.vazioSemElegibilidadeSubtitulo}
          ctaLabel="Concluir diagnóstico"
          ctaHref="/corredor/comecar"
        />
      </div>
    );
  }

  // §7 — onboarding de uma tela, uma única vez.
  const perfil = await getPerfilPsicologia(user.id);
  if (!perfil.viuOnboarding) {
    return <OnboardingPsicologia nomePsicologo={NOME_PSICOLOGO_PADRAO} />;
  }

  // RF-8 — o check-in só fica disponível na cadência esperada, exceto
  // quando a Returnista pede pra falar antes disso (regra §6: "o check-in
  // nunca é a única porta de entrada" — C4/C5 existem justamente pra não
  // depender de esperar a cadência).
  const cadencia = await getCadenciaCorredor(user.id, avaliacao);
  const podeResponder = cadencia?.emAtraso || agora === "1";

  if (!podeResponder) {
    return (
      <div className="flex flex-col gap-6">
        <Eyebrow>PSICOLOGIA DO ESPORTE</Eyebrow>
        <EmptyState
          subtitulo={corredorCopy.vazioAindaNaoChegou}
          ctaLabel={corredorCopy.ctaFalarAgora}
          ctaHref="/corredor/psicologia/check-in?agora=1"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <Eyebrow>PSICOLOGIA DO ESPORTE</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Como você está, por dentro?</h1>
      </div>
      <CheckinPsicologiaForm nomePsicologo={NOME_PSICOLOGO_PADRAO} />
    </div>
  );
}
