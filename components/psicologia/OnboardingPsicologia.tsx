"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { marcarOnboardingPsicologiaVistoAction } from "@/lib/psicologia/actions";
import { onboardingPsicologia } from "@/lib/psicologia/copy";

/**
 * §7 do PRD — uma única tela, exibida uma única vez na primeira visita à
 * área de Psicologia (mesmo mecanismo de controle já usado em Fisioterapia
 * e no Painel: campo booleano em usuarios, nunca modal bloqueante). A tela
 * de destino (check-in) é a própria tela atual — diferente de
 * OnboardingPrescricao/OnboardingPainel, que levam pra outro lugar, aqui só
 * atualiza a flag e deixa a mesma página renderizar o check-in em seguida.
 */
export function OnboardingPsicologia({ nomePsicologo }: { nomePsicologo: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function continuar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await marcarOnboardingPsicologiaVistoAction();
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card variant="pillar" className="mx-auto max-w-xl p-8 text-center">
      <Eyebrow>{onboardingPsicologia.eyebrow}</Eyebrow>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        {onboardingPsicologia.titulo} <span className="text-fire">{onboardingPsicologia.tituloDestaque}</span>
      </h1>
      <p className="mt-4 font-sans text-sm leading-relaxed text-mid">{onboardingPsicologia.corpo(nomePsicologo)}</p>
      {erro && (
        <p className="mt-4 text-sm font-sans text-fire-text" role="alert">
          {erro}
        </p>
      )}
      <Button type="button" variant="primary" className="mt-6" loading={pending} onClick={continuar}>
        {onboardingPsicologia.cta}
      </Button>
    </Card>
  );
}
