import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contato — Run Again" };

export default function ContatoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
        CONTATO
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Fala com a gente.</h1>
      <p className="mt-5 font-sans text-base leading-relaxed text-mid">
        Durante o beta, o canal direto é o e-mail{" "}
        <a href="mailto:contato@runagain.app" className="text-fire-text hover:underline">
          contato@runagain.app
        </a>
        . Dúvida sobre código de convite, problema de acesso ou feedback sobre o
        protocolo — é o mesmo endereço.
      </p>
    </main>
  );
}
