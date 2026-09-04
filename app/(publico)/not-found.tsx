import { ErrorState } from "@/components/estados/ErrorState";
import { getSessao } from "@/lib/auth/session";

// Sem Header/Footer aqui: app/(publico)/layout.tsx já envolve este segmento
// com os dois. Sem este arquivo, o notFound() disparado de dentro de
// (publico) (por exemplo /blog/[pilar] com slug inválido) cai no
// app/not-found.tsx da raiz, que renderiza seu próprio Header/Footer e
// duplica os dois por cima dos que o layout já desenha.
export default async function NotFoundPublico() {
  const sessao = await getSessao();
  const ctaHref = sessao ? `/${sessao.papel}/painel` : "/";
  const ctaLabel = sessao ? "Voltar ao painel" : "Voltar ao início";

  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-4 py-24">
      <ErrorState variant="404" ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </main>
  );
}
