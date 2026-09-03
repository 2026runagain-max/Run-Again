"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { marcarOnboardingPainelVistoAction } from "@/lib/painel/actions";
import { onboardingPainel } from "@/lib/painel/copy";

/**
 * RF10 — exibido uma única vez, na primeira visita ao painel já com
 * diagnóstico pronto. Nunca modal bloqueante (RF10-CA1): é o próprio
 * conteúdo da tela.
 */
export function OnboardingPainel() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function continuar() {
    startTransition(async () => {
      await marcarOnboardingPainelVistoAction();
      router.push("/corredor/minha-recuperacao/sessao");
    });
  }

  return (
    <Card variant="pillar" className="mx-auto max-w-xl p-8 text-center">
      <Eyebrow>{onboardingPainel.eyebrow}</Eyebrow>
      {/* h2: a página já tem seu h1 ("Oi, {nome}") acima deste card. */}
      <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        {onboardingPainel.titulo} <span className="text-fire">{onboardingPainel.tituloDestaque}</span>
      </h2>
      <p className="mt-4 font-sans text-sm leading-relaxed text-mid">{onboardingPainel.corpo}</p>
      <Button type="button" variant="primary" className="mt-6" loading={pending} onClick={continuar}>
        {onboardingPainel.cta}
      </Button>
    </Card>
  );
}
