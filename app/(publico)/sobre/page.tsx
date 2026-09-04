import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { PersonaCard } from "@/components/marketing/PersonaCard";
import { fundadores, fechamentoQuemSomos } from "@/lib/site/fundadores";
import { personasSite } from "@/lib/site/personas";
import { labelPersona } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Sobre — Run Again",
  description:
    "O manifesto do Run Again, quem está por trás do protocolo e a tribo de corredores que ele foi feito para servir.",
};

export default function SobrePage() {
  return (
    <main>
      {/* Manifesto — mesmas frases já aprovadas na copy de home
          (copy/home-lista-fundadoras.md), reunidas aqui como declaração de
          princípio em vez de repetidas dentro do funil de conversão. */}
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>Manifesto</Eyebrow>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">
            Hobby não tem teto.
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-silver">
            Você não se machucou por pedir demais do seu corpo. Se machucou porque
            ninguém te preparou pro tamanho da sua ambição.
          </p>
          <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-silver">
            Dá pra levar a corrida a sério — treinar forte, ter meta, querer evoluir —
            sem isso ser exagero.
          </p>
          <p className="mt-8 font-display text-3xl text-fire">
            Cuidado não é pegar leve. É pegar certo.
          </p>
        </div>
      </section>

      {/* Quem somos — texto idêntico ao da home (lib/site/fundadores.ts),
          §6.6 do PRD "Site Aberto" manda reusar exatamente este texto. */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>Quem somos</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Duas pessoas que já passaram pelos dois lados dessa história.
        </h2>

        <div className="mt-10 flex flex-col gap-10">
          {/* Foto oficial pendente — usar iniciais até lá (nota de produção
              da copy de home), nunca foto de banco de imagens genérica. */}
          {fundadores.map((fundador) => (
            <div key={fundador.nome} className="flex flex-col gap-4 sm:flex-row">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-fire-dim font-display text-2xl text-fire-text"
                aria-hidden="true"
              >
                {fundador.inicial}
              </div>
              <div>
                <h3 className="font-display text-xl text-ink">
                  {fundador.nome} — {fundador.papel}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-mid">
                  {fundador.texto}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 font-sans text-base leading-relaxed text-ink">
          {fechamentoQuemSomos}
        </p>
      </section>

      {/* Tribo — Persona Cards */}
      <section className="bg-smoke px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>A tribo Run Again</Eyebrow>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Você provavelmente se reconhece em uma dessas três.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {personasSite.map((persona) => (
              <PersonaCard
                key={persona.valor}
                emoji={persona.emoji}
                nome={labelPersona[persona.valor]}
                quote={persona.quote}
                descricao={persona.descricao}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Onde o Run Again está agora */}
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Card variant="insight">
          <p className="font-sans text-sm leading-relaxed text-ink">
            Estamos em fase de construção e teste com um grupo pequeno de propósito —
            50 vagas e 90 dias de acesso gratuito para validar o protocolo antes de
            abrir para mais corredores.
          </p>
        </Card>
      </section>
    </main>
  );
}
