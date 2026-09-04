"use client";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { onboardingSensivel } from "@/lib/nutricao/copy";

export function OnboardingSensivel({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div>
        <Eyebrow>{onboardingSensivel.eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-2xl leading-tight text-ink sm:text-3xl">
          {onboardingSensivel.titulo} <span className="text-fire">{onboardingSensivel.tituloDestaque}</span>
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-mid">{onboardingSensivel.corpo}</p>
      </div>
      <Button type="button" variant="primary" className="self-center" onClick={onNext}>
        {onboardingSensivel.cta}
      </Button>
    </div>
  );
}
