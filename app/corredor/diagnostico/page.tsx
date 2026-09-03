import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";
import { bandaRiscoLabel, diagnosticoCopy, estados } from "@/lib/avaliacao/copy";

export const metadata: Metadata = { title: "Meu diagnóstico — Run Again" };

export default async function DiagnosticoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const avaliacao = await getAvaliacaoAtual(user.id);

  // RF05-CA4 acessível a qualquer momento, mas só depois de concluída
  // (RF04-CA1 — nunca há diagnóstico parcial pra mostrar).
  if (!avaliacao?.concluida_em || !avaliacao.banda_risco) {
    redirect("/corredor/comecar");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-4">
      {/* Confirmação — texto exato do PRD (§8), tratada como uma linha
          discreta, não mais um card igual aos outros: o que importa nesta
          tela é o que vem a seguir, não a confirmação de que ela existe. */}
      <div className="flex items-center justify-center gap-2 text-center">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-ink">
          <path d="M4 10.5L8 14.5L16 5.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-sans text-sm text-mid">{estados.sucessoAvaliacaoConcluida}</p>
      </div>

      {/* Hero — a "coisa verdadeira" prometida pelo Fluxo 2: quem você é,
          nomeado com precisão, e a banda de risco que decide o ritmo certo
          pra você. Fundo --ink de propósito: é o único momento da tela que
          precisa parar o scroll, não decoração. */}
      <div className="rounded-2xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <Eyebrow dark>{diagnosticoCopy.eyebrow}</Eyebrow>
        <h1 className="mt-3 font-sans text-xl font-semibold leading-snug text-white sm:text-2xl">
          {avaliacao.frase_identidade}
        </h1>

        <div className="mt-8 border-t border-white/15 pt-8">
          <p className="text-xs font-sans font-semibold uppercase tracking-wide text-silver">
            {diagnosticoCopy.bandaRiscoLabel}
          </p>
          <p className="mt-2 font-display text-4xl leading-none text-fire">{bandaRiscoLabel[avaliacao.banda_risco]}</p>
          <p className="mt-3 font-sans text-sm leading-relaxed text-silver">{avaliacao.banda_risco_frase}</p>
        </div>
      </div>

      {/* Leitura de apoio — hipóteses, não módulos clicáveis: texto corrido,
          sem chrome de card, pra não competir visualmente com o hero nem
          parecer mais um bloco genérico empilhado. */}
      <div className="flex flex-col gap-6 border-t border-mid/10 pt-6">
        <div>
          <Eyebrow>{diagnosticoCopy.perfilBiomecanicoLabel}</Eyebrow>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{avaliacao.perfil_biomecanico_frase}</p>
          <p className="mt-1 text-xs font-sans text-mid">{diagnosticoCopy.perfilBiomecanicoAviso}</p>
        </div>

        <div>
          <Eyebrow>{diagnosticoCopy.perfilPsicologicoLabel}</Eyebrow>
          <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{avaliacao.perfil_psicologico_frase}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-mid/10 pt-6">
        <Eyebrow>{diagnosticoCopy.pontosAtencaoLabel}</Eyebrow>
        {avaliacao.pontos_atencao.map((ponto) => (
          <Card key={ponto.titulo} variant="insight">
            <Eyebrow>{ponto.titulo}</Eyebrow>
            <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{ponto.texto}</p>
          </Card>
        ))}
      </div>

      <div className="border-t border-mid/10 pt-6">
        <Eyebrow>{diagnosticoCopy.proximosPassosLabel}</Eyebrow>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink">{diagnosticoCopy.proximosPassosTexto}</p>
      </div>

      <p className="text-center text-xs font-sans text-mid">{diagnosticoCopy.avisoHipotese}</p>

      <Button variant="ghost" href="/corredor/comecar?modo=editar" className="self-center border-ink text-ink hover:bg-ink/5">
        {diagnosticoCopy.editarCta}
      </Button>
    </div>
  );
}
