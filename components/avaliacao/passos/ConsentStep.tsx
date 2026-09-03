"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { registrarConsentimentoSaudeAction } from "@/lib/avaliacao/actions";
import { consentimentoSaude } from "@/lib/avaliacao/copy";

export function ConsentStep({ onNext }: { onNext: () => void }) {
  const [state, formAction, pending] = useActionState(registrarConsentimentoSaudeAction, null);
  const [aceite, setAceite] = useState(false);

  useEffect(() => {
    if (state?.ok) onNext();
  }, [state, onNext]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div>
        <Eyebrow>{consentimentoSaude.eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-2xl leading-tight text-ink sm:text-3xl">
          {consentimentoSaude.titulo} <span className="text-fire">{consentimentoSaude.tituloDestaque}</span>
        </h1>
        <p className="mt-3 font-sans text-sm leading-relaxed text-mid">
          {consentimentoSaude.corpo}{" "}
          <Link href="/privacidade" className="font-semibold text-fire-text hover:underline">
            política de privacidade
          </Link>
          .
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-[14px] border border-mid/25 bg-white p-4 text-sm font-sans text-ink">
        <input
          type="checkbox"
          name="aceite"
          checked={aceite}
          onChange={(e) => setAceite(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-mid/40 text-fire focus:ring-fire/30"
        />
        <span>{consentimentoSaude.checkbox}</span>
      </label>

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} disabled={!aceite} className="self-start">
        {consentimentoSaude.cta}
      </Button>
    </form>
  );
}
