import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ErrorState } from "@/components/estados/ErrorState";
import { OnboardingComunidade } from "@/components/comunidade/OnboardingComunidade";
import { FeedEvidencias } from "@/components/comunidade/FeedEvidencias";
import { EspacoConversa } from "@/components/comunidade/EspacoConversa";
import { createClient } from "@/lib/supabase/server";
import { getEspacoConversaResultado, getFeedEvidenciasResultado, getPerfilComunidade } from "@/lib/comunidade/queries";
import { comunidadeCopy } from "@/lib/comunidade/copy";

export const metadata: Metadata = { title: "Comunidade — Run Again" };

// Nota de arquitetura: o PRD nomeia esta tela como rota top-level
// (/comunidade). Neste repositório real, /corredor/* é o limite que o
// middleware usa pra exigir sessão + papel=corredor + persona definida
// (lib/supabase/middleware.ts) e onde app/corredor/layout.tsx já monta
// Header/Footer da área logada — uma rota /comunidade fora desse prefixo
// ficaria sem essas 3 proteções (ou exigiria duplicá-las). Por isso a
// Comunidade vive em /corredor/comunidade, mesma convenção de todo o resto
// do produto (/corredor/painel, /corredor/psicologia/check-in etc.) — o
// mesmo tipo de decisão já registrado em 0008_comunidade.sql pras 2 outras
// divergências de schema/RLS do PRD.
export default async function ComunidadePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // §7 — onboarding de uma tela, uma única vez.
  const perfil = await getPerfilComunidade(user.id);
  if (!perfil.viuOnboarding) {
    return <OnboardingComunidade />;
  }

  const [feedResultado, conversaResultado] = await Promise.all([
    getFeedEvidenciasResultado(user.id),
    getEspacoConversaResultado(user.id),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <Eyebrow>COMUNIDADE</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Você não está sozinha nisso.</h1>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">{comunidadeCopy.tituloFeed}</h2>
          <p className="mt-1 font-sans text-sm text-mid">{comunidadeCopy.subtituloFeed}</p>
        </div>

        {feedResultado.ok ? (
          <FeedEvidencias posts={feedResultado.data} viewerId={user.id} />
        ) : (
          <ErrorState
            subtitulo={comunidadeCopy.erroFeed}
            ctaLabel={comunidadeCopy.tentarDeNovo}
            ctaHref="/corredor/comunidade"
          />
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-mid/10 pt-8">
        <div>
          <h2 className="font-display text-2xl text-ink">{comunidadeCopy.tituloConversa}</h2>
          <p className="mt-1 font-sans text-sm text-mid">{comunidadeCopy.subtituloConversa}</p>
        </div>

        {conversaResultado.ok ? (
          <EspacoConversa topicos={conversaResultado.data} viewerId={user.id} />
        ) : (
          <ErrorState
            subtitulo={comunidadeCopy.erroConversa}
            ctaLabel={comunidadeCopy.tentarDeNovo}
            ctaHref="/corredor/comunidade"
          />
        )}
      </section>
    </div>
  );
}
