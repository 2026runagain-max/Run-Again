import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade — Run Again" };

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire">
        PRIVACIDADE
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">Política de Privacidade</h1>
      <div className="mt-6 flex flex-col gap-4 font-sans text-sm leading-relaxed text-mid">
        <p>
          Tratamos seu nome e e-mail com base no seu consentimento explícito, dado no
          momento do cadastro. Nenhum dado de saúde é coletado neste fluxo — isso
          passa a valer a partir dos fluxos de fisioterapia, nutrição e demais pilares
          clínicos, cada um com seu próprio consentimento específico.
        </p>
        <p>
          Você pode pedir a exclusão da sua conta a qualquer momento pelo canal de
          contato. Seu acesso é suspenso de imediato; a exclusão definitiva dos dados
          segue o prazo legal aplicável.
        </p>
        <p>
          Este texto é um placeholder do fluxo de fundação técnica. A versão jurídica
          definitiva desta política é responsabilidade da área jurídica do Run Again.
        </p>
      </div>
    </main>
  );
}
