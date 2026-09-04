"use client";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { onboardingIntro } from "@/lib/avaliacao/copy";

export function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <Eyebrow>{onboardingIntro.eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">{onboardingIntro.titulo}</h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-mid">{onboardingIntro.corpo}</p>
      </div>
      <Button type="button" variant="primary" className="self-center" onClick={onNext}>
        {onboardingIntro.cta}
      </Button>
    </div>
  );
}
