import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorState } from "@/components/estados/ErrorState";
import { getSessao } from "@/lib/auth/session";

export default async function NotFound() {
  const sessao = await getSessao();
  const ctaHref = sessao ? `/${sessao.papel}/painel` : "/";
  const ctaLabel = sessao ? "Voltar ao painel" : "Voltar ao início";

  return (
    <>
      <Header area="publico" sessao={sessao} />
      <main className="flex flex-1 items-center justify-center bg-paper px-4 py-24">
        <ErrorState variant="404" ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>
      <Footer />
    </>
  );
}
