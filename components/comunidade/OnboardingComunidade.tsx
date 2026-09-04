"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { marcarOnboardingComunidadeVistoAction } from "@/lib/comunidade/actions";
import { onboardingComunidade } from "@/lib/comunidade/copy";

/**
 * §7 do PRD — uma única tela, exibida uma única vez na primeira visita a
 * /corredor/comunidade (flag própria, nunca reaproveita a de outro fluxo —
 * mesmo mecanismo de OnboardingPsicologia/OnboardingPainel). Não é modal
 * bloqueante: é o próprio conteúdo da tela, e a tela de destino (o hub em
 * si) é a mesma página, renderizada em seguida.
 */
export function OnboardingComunidade() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function continuar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await marcarOnboardingComunidadeVistoAction();
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card variant="pillar" className="mx-auto max-w-xl p-8 text-center">
      <Eyebrow>{onboardingComunidade.eyebrow}</Eyebrow>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        {onboardingComunidade.titulo} <span className="text-fire">{onboardingComunidade.tituloDestaque}</span>
      </h1>
      <p className="mt-4 font-sans text-sm leading-relaxed text-mid">{onboardingComunidade.corpoFeed}</p>
      <p className="mt-3 font-sans text-sm leading-relaxed text-mid">{onboardingComunidade.corpoConversa}</p>
      {erro && (
        <p className="mt-4 text-sm font-sans text-fire-text" role="alert">
          {erro}
        </p>
      )}
      <Button type="button" variant="primary" className="mt-6" loading={pending} onClick={continuar}>
        {onboardingComunidade.cta}
      </Button>
    </Card>
  );
}
