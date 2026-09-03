import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sobre — Run Again" };

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire">
        SOBRE
      </p>
      <h1 className="mt-2 font-display text-4xl text-ink">
        Retorno ao esporte é protocolo, não sorte.
      </h1>
      <p className="mt-5 font-sans text-base leading-relaxed text-mid">
        O Run Again nasceu para o corredor que se lesionou e não sabe mais em quem
        confiar: no próprio corpo, no próximo treino, no próprio julgamento. Reunimos
        fisioterapia, preparo físico, nutrição esportiva, medicina do esporte e
        psicologia do esporte em um ecossistema clínico coordenado — com evidência
        científica, progressão real e respeito pela carga de vida de quem também
        trabalha, dorme mal às vezes e não vive só para correr.
      </p>
      <p className="mt-4 font-sans text-base leading-relaxed text-mid">
        Estamos em fase de beta fechado, com 50 vagas e 90 dias de acesso gratuito
        para validar o protocolo com o time clínico do Run Again antes de abrir para
        mais corredores.
      </p>
    </main>
  );
}
