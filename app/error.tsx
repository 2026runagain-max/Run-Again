"use client";

import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorState } from "@/components/estados/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header area="publico" sessao={null} />
      <main className="flex flex-1 items-center justify-center bg-paper px-4 py-24">
        <ErrorState variant="generico" onCta={reset} />
      </main>
      <Footer />
    </>
  );
}
