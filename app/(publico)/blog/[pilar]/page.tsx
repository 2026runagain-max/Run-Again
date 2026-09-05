import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/estados/EmptyState";
import { pilaresBlog, getPilarBlog } from "@/lib/blog/pilares";
import { getArtigosPorPilar } from "@/lib/blog/content";

export function generateStaticParams() {
  return pilaresBlog.map((pilar) => ({ pilar: pilar.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pilar: string }>;
}): Promise<Metadata> {
  const { pilar: pilarSlug } = await params;
  const pilar = getPilarBlog(pilarSlug);
  if (!pilar) return { title: "Pilar não encontrado — Run Again" };

  return {
    title: `${pilar.nome} — Blog Run Again`,
    description: pilar.descricao,
  };
}

export default async function BlogPilarPage({
  params,
}: {
  params: Promise<{ pilar: string }>;
}) {
  const { pilar: pilarSlug } = await params;
  const pilar = getPilarBlog(pilarSlug);
  if (!pilar) notFound();

  const artigos = getArtigosPorPilar(pilar.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-sans text-sm text-mid">
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>{" "}
        / {pilar.nome}
      </p>
      <Eyebrow className="mt-4">{pilar.nome}</Eyebrow>
      <h1 className="mt-2 font-display text-4xl text-ink">{pilar.nome}</h1>
      <p className="mt-3 max-w-xl font-sans text-sm text-mid">{pilar.descricao}</p>

      {artigos.length === 0 ? (
        <EmptyState
          className="mt-10"
          subtitulo="Os primeiros artigos deste pilar estão em produção — entra na lista de fundadores na home pra saber quando saírem."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-5">
          {artigos.map((artigo) => (
            <li key={artigo.slug}>
              <Link href={`/blog/${pilar.slug}/${artigo.slug}`}>
                <Card variant="pillar" className="transition-shadow hover:shadow-md">
                  <h2 className="font-display text-xl text-ink">{artigo.titulo}</h2>
                  <p className="mt-1 text-sm font-sans text-mid">{artigo.resumo}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
