import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSessao } from "@/lib/auth/session";

export default async function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessao();

  return (
    <>
      <Header area="publico" sessao={sessao} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
