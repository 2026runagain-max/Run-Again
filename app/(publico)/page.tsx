import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const pilares = [
  {
    titulo: "Fisioterapia",
    texto: "Protocolo de retorno ao esporte com evidência científica, não repouso genérico.",
  },
  {
    titulo: "Preparo físico",
    texto: "Progressão de carga que respeita sua carga de vida — trabalho, sono, estresse.",
  },
  {
    titulo: "Ecossistema clínico",
    texto: "Fisioterapia, nutrição, medicina do esporte e psicologia do esporte, coordenados.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="bg-ink px-4 py-20 text-center sm:px-6">
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire">
          RUN AGAIN · BETA — 50 VAGAS
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-tight text-white sm:text-6xl">
          Voltar a correr não é sorte. É <span className="text-fire">protocolo</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-sans text-base text-silver">
          Para o corredor que se machucou e não sabe se pode confiar no próprio corpo de
          novo. Antifrágil se constrói com progressão, não com medo.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/cadastro" variant="primary">
            Começar com código de convite
          </Button>
          <Button
            href="/login"
            variant="ghost"
            className="border-white/18 text-white"
          >
            Já tenho conta
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {pilares.map((pilar) => (
            <Card key={pilar.titulo} variant="pillar">
              <h2 className="font-display text-2xl text-ink">{pilar.titulo}</h2>
              <p className="mt-2 font-sans text-sm text-mid">{pilar.texto}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
