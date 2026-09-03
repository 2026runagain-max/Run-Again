import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSessao } from "@/lib/auth/session";

export default async function CorredorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessao();

  // O middleware já bloqueia isto — checagem redundante de propósito
  // (defesa em profundidade, RF05).
  if (!sessao || sessao.papel !== "corredor") {
    redirect("/login");
  }

  return (
    <>
      <Header area="corredor" sessao={sessao} />
      <div className="flex flex-1 flex-col bg-paper">
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}
