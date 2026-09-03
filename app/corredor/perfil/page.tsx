import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { getPerfilCompleto } from "@/lib/auth/perfil";
import { labelPersona } from "@/lib/labels";

export const metadata: Metadata = { title: "Perfil — Run Again" };

function diasRestantes(trialTerminaEm: string | null) {
  if (!trialTerminaEm) return null;
  const ms = new Date(trialTerminaEm).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default async function PerfilCorredorPage() {
  const perfil = await getPerfilCompleto();
  const dias = perfil ? diasRestantes(perfil.trial_termina_em) : null;

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">PERFIL</h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        {dias !== null && (
          <Card
            variant="pillar"
            className="flex shrink-0 flex-col items-center gap-1 p-6 text-center sm:w-44"
          >
            <p className="font-display text-5xl leading-none text-fire">{dias}</p>
            <p className="mt-2 text-xs font-sans font-semibold uppercase tracking-wide text-mid">
              {dias === 1 ? "dia restante de beta" : "dias restantes de beta"}
            </p>
            <p className="mt-1 text-xs font-sans text-mid">
              Sem cobrança em nenhum deles.
            </p>
          </Card>
        )}

        <Card variant="pillar" className="flex flex-1 flex-col gap-4">
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
              Nome
            </p>
            <p className="font-sans text-ink">{perfil?.nome}</p>
          </div>
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
              E-mail
            </p>
            <p className="font-sans text-ink">{perfil?.email}</p>
          </div>
          <div>
            <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
              Persona
            </p>
            <p className="font-sans text-ink">
              {perfil?.persona
                ? labelPersona[perfil.persona]
                : "Ainda não identificada — o onboarding cuida disso."}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
