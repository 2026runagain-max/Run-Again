import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/estados/EmptyState";
import { ListaFundadorasForm } from "@/components/marketing/ListaFundadorasForm";
import { pilaresBlog } from "@/lib/blog/pilares";
import { getDestaques } from "@/lib/blog/content";

export const metadata: Metadata = {
  title: "Blog — Run Again",
  description:
    "Artigos e guias sobre retorno ao esporte, treino, preparo físico, nutrição esportiva e psicologia do esporte para o corredor amador.",
};

export default function BlogPage() {
  const destaques = getDestaques();

  return (
    <main>
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>Blog Run Again</Eyebrow>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">
            Conteúdo pra quem está voltando a correr.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-silver">
            Treino, preparo físico, nutrição esportiva e psicologia do
            esporte — explicados com evidência científica, sem urgência fabricada.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Eyebrow>Destaques</Eyebrow>
        <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
          O que ler primeiro
        </h2>

        {destaques.length === 0 ? (
          <EmptyState
            className="mt-6"
            subtitulo="Ainda estamos publicando os primeiros artigos. Enquanto isso, explora os pilares abaixo ou entra na lista de fundadores pra saber quando sair o primeiro."
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {destaques.map((artigo) => (
              <Link key={`${artigo.pilar}/${artigo.slug}`} href={`/blog/${artigo.pilar}/${artigo.slug}`}>
                <Card variant="pillar" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-md">
                  <h3 className="font-display text-xl text-ink">{artigo.titulo}</h3>
                  <p className="text-sm font-sans text-mid">{artigo.resumo}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-paper px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Navegue por pilar</Eyebrow>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            Escolha o assunto
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pilaresBlog.map((pilar) => (
              <Link key={pilar.slug} href={`/blog/${pilar.slug}`}>
                <Card variant="pillar" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-md">
                  <h3 className="font-display text-xl text-ink">{pilar.nome}</h3>
                  <p className="text-sm font-sans text-mid">{pilar.descricao}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <Card variant="insight">
          <Eyebrow>Não perca o próximo artigo</Eyebrow>
          <h2 className="mt-2 font-display text-2xl text-ink">
            Entra na lista de fundadores
          </h2>
          <p className="mt-2 font-sans text-sm text-mid">
            Mesmo cadastro da home — sem cartão, sem checkout.
          </p>
          <ListaFundadorasForm origem="blog" className="mt-5" />
        </Card>
      </section>
    </main>
  );
}
