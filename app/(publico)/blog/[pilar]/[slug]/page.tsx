import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { ListaFundadorasForm } from "@/components/marketing/ListaFundadorasForm";
import { getPilarBlog } from "@/lib/blog/pilares";
import { artigos, getArtigo } from "@/lib/blog/content";
import { SITE_URL } from "@/lib/site/config";

// Template pronto para receber conteúdo real via Pull Request (§12 do PRD
// "Site Aberto") — nenhum artigo é inventado nesta tarefa, então
// generateStaticParams está vazio até o primeiro artigo entrar em
// lib/blog/content.ts.
export function generateStaticParams() {
  return artigos.map((artigo) => ({ pilar: artigo.pilar, slug: artigo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pilar: string; slug: string }>;
}): Promise<Metadata> {
  const { pilar: pilarSlug, slug } = await params;
  const artigo = getArtigo(pilarSlug, slug);
  if (!artigo) return { title: "Artigo não encontrado — Run Again" };

  return {
    title: `${artigo.titulo} — Blog Run Again`,
    description: artigo.resumo,
  };
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ pilar: string; slug: string }>;
}) {
  const { pilar: pilarSlug, slug } = await params;
  const pilar = getPilarBlog(pilarSlug);
  const artigo = getArtigo(pilarSlug, slug);
  if (!pilar || !artigo) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artigo.titulo,
    description: artigo.resumo,
    author: { "@type": "Person", name: artigo.autorNome },
    reviewedBy: { "@type": "Person", name: artigo.revisorNome },
    datePublished: artigo.publicadoEm,
    url: `${SITE_URL}/blog/${pilar.slug}/${artigo.slug}`,
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="font-sans text-sm text-mid">
        <Link href="/" className="hover:underline">
          Blog
        </Link>{" "}
        /{" "}
        <Link href={`/blog/${pilar.slug}`} className="hover:underline">
          {pilar.nome}
        </Link>
      </p>

      <Eyebrow className="mt-4">{pilar.nome}</Eyebrow>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{artigo.titulo}</h1>
      <p className="mt-3 font-sans text-xs text-mid">
        Por {artigo.autorNome} · revisado por {artigo.revisorNome} (
        {artigo.revisorCredencial})
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {artigo.corpo.split("\n\n").map((paragrafo, i) => (
          <p key={i} className="font-sans text-base leading-[1.7] text-ink">
            {paragrafo}
          </p>
        ))}
      </div>

      <Card variant="insight" className="mt-12">
        <Eyebrow>Continue por aqui</Eyebrow>
        <h2 className="mt-2 font-display text-2xl text-ink">
          Entra na lista de fundadores
        </h2>
        <p className="mt-2 font-sans text-sm text-mid">
          Sem cartão, sem checkout — só pra saber quando o Run Again abrir.
        </p>
        <ListaFundadorasForm origem="blog" className="mt-5" />
      </Card>
    </main>
  );
}
