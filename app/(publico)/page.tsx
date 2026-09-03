import { Button } from "@/components/ui/Button";

const protocolo = [
  {
    titulo: "Fisioterapia",
    texto:
      "Retorno ao esporte com evidência científica — não repouso genérico até 'melhorar'.",
  },
  {
    titulo: "Preparo físico",
    texto:
      "Progressão de carga real, calculada com a sua carga de vida: trabalho, sono, estresse — não só o pace.",
  },
  {
    titulo: "Ecossistema clínico",
    texto:
      "Nutrição esportiva, medicina e psicologia do esporte, coordenadas com a fisioterapia — não isoladas.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="bg-ink px-4 py-20 text-center sm:px-6">
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire">
          RUN AGAIN · BETA — 50 VAGAS
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-5xl leading-tight text-white sm:text-6xl">
          Levar corrida a sério não é <span className="text-fire">frescura</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-sans text-base text-silver">
          Você se machucou e desconfia do próprio corpo — mesmo sabendo que é
          &ldquo;só&rdquo; uma corrida de fim de semana. Isso tem nome: Returnista. Tem
          protocolo também: evidência científica, progressão real e respeito pela sua
          carga de vida, não só pela sua vontade de voltar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/cadastro" variant="primary">
            Usar meu código de convite
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

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          O PROTOCOLO
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          Nada disso funciona sozinho.
        </h2>
        <p className="mt-2 max-w-md font-sans text-sm text-mid">
          Três frentes clínicas, coordenadas — não um app de fisioterapia com um blog
          de nutrição do lado.
        </p>

        <ol className="mt-10 flex flex-col divide-y divide-mid/15">
          {protocolo.map((item, i) => (
            <li key={item.titulo} className="flex gap-5 py-7 first:pt-0 last:pb-0 sm:gap-8">
              <span
                className="w-12 shrink-0 font-display text-4xl text-fire sm:w-16 sm:text-5xl"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl text-ink sm:text-2xl">
                  {item.titulo}
                </h3>
                <p className="mt-1 max-w-md font-sans text-sm text-mid">{item.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 font-sans text-sm text-mid">
          Conduzido pela <span className="font-semibold text-ink">Equipe Run Again</span>{" "}
          — fisioterapeutas, educadores físicos, nutricionistas esportivos, médicos e
          psicólogos do esporte contratados diretamente. Não é uma rede aberta de
          credenciados.
        </p>
      </section>
    </>
  );
}
