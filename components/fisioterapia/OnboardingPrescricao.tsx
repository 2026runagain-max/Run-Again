"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { marcarOnboardingVistoAction } from "@/lib/fisioterapia/actions-corredor";
import { onboarding } from "@/lib/fisioterapia/copy";

export function OnboardingPrescricao() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function continuar() {
    startTransition(async () => {
      await marcarOnboardingVistoAction();
      router.push("/corredor/minha-recuperacao/sessao");
    });
  }

  return (
    <Card variant="pillar" className="mx-auto max-w-xl p-8 text-center">
      <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
        {onboarding.eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        {onboarding.titulo} <span className="text-fire">{onboarding.tituloDestaque}</span>
      </h1>
      <p className="mt-4 font-sans text-sm leading-relaxed text-mid">{onboarding.corpo}</p>
      <Button type="button" variant="primary" className="mt-6" loading={pending} onClick={continuar}>
        {onboarding.cta}
      </Button>
    </Card>
  );
}
