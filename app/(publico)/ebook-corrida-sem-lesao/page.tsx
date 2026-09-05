import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ListaFundadorasForm } from "@/components/marketing/ListaFundadorasForm";
import { CartaoConversao } from "@/components/marketing/CartaoConversao";
import { fundadores } from "@/lib/site/fundadores";
import { SITE_URL } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Ebook Corrida sem Lesão — Run Again",
  description:
    "O guia de retorno ao esporte sem repetir o erro que te machucou — escrito com o mesmo rigor clínico usado com atletas.",
};

const gustavo = fundadores.find((f) => f.nome === "Gustavo")!;

const topicos = [
  "Por que 'descanso total' costuma ser o conselho errado — e o que fazer no lugar dele.",
  "Os sinais de alerta que dizem quando parar de verdade, em vez de adivinhar.",
  "Como retomar a corrida em progressão real, sem repetir o erro que te machucou da primeira vez.",
  "Onde a fisioterapia termina e o preparo físico começa — e por que os dois precisam se conversar.",
];

const faq = [
  {
    pergunta: "Em que formato eu recebo o ebook?",
    resposta:
      "[FORMATO DE ENTREGA A DEFINIR]. Se você entrar pela lista de fundadores, ele chega no seu e-mail assim que o cadastro é confirmado.",
  },
  {
    pergunta: "Preciso pagar pra ter acesso?",
    resposta:
      "Não, se você entrar na lista de fundadores: o ebook é o bônus de quem se cadastra (valor percebido de R$47). A compra avulsa abaixo é pra quem já tem convite de beta ou não quer entrar na lista agora.",
  },
  {
    pergunta: "Isso é o mesmo protocolo do app Run Again?",
    resposta:
      "É o mesmo rigor clínico e o mesmo time, num formato menor: um guia de leitura, não um acompanhamento com profissional. Pra isso, o caminho é o beta do app.",
  },
];

export default function EbookPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_URL}/ebook-corrida-sem-lesao`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: { "@type": "Answer", text: item.resposta },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Dor nomeada */}
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>Ebook · Corrida sem Lesão</Eyebrow>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">
            Volte a correr sem repetir o erro que te machucou.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-silver">
            Você olha pro tênis parado no canto e pensa duas vezes antes de calçar. O
            medo não é fraqueza — é memória do corpo. Este guia existe pra você voltar
            de olhos abertos, não no escuro.
          </p>
        </div>
      </section>

      {/* 2. Credencial clínica */}
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Eyebrow>Quem assina</Eyebrow>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-fire-dim font-display text-2xl text-fire-text"
            aria-hidden="true"
          >
            {gustavo.inicial}
          </div>
          <div>
            <h2 className="font-display text-xl text-ink">
              {gustavo.nome} — {gustavo.papel}
            </h2>
            <p className="mt-2 font-sans text-sm leading-relaxed text-mid">
              {gustavo.texto}
            </p>
          </div>
        </div>
      </section>

      {/* 3. O que está dentro */}
      <section className="bg-smoke px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Eyebrow>O que está dentro</Eyebrow>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            O que você vai encontrar no guia
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {topicos.map((topico) => (
              <li key={topico} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fire" aria-hidden="true" />
                <p className="font-sans text-sm leading-relaxed text-ink">{topico}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 font-sans text-xs text-mid">
            [Sumário completo do ebook a definir antes da publicação final.]
          </p>
        </div>
      </section>

      {/* 4. Prova */}
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Eyebrow>Por que confiar</Eyebrow>
        <Card variant="insight" className="mt-4 text-center">
          <p className="font-display text-2xl text-ink sm:text-3xl">7 em cada 10</p>
          <p className="mx-auto mt-2 max-w-md font-sans text-sm leading-relaxed text-ink">
            No Brasil, 7 em cada 10 corredores se lesionam todo ano — e a maioria volta
            a treinar do mesmo jeito que se machucou da primeira vez. Este guia existe
            pra você não ser a maioria.
          </p>
        </Card>
        <Card variant="pillar" className="mt-5">
          <p className="font-sans text-sm italic text-mid">
            [DEPOIMENTO REAL — pendente de consentimento explícito e separado de quem
            testou o guia. Nenhum depoimento é publicado sem esse consentimento.]
          </p>
        </Card>
      </section>

      {/* 5. Oferta / formato de entrega */}
      <section className="bg-ink-2 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <Card variant="ghost" className="flex flex-col gap-4 p-6">
            <Eyebrow dark>Caminho 1 — de graça</Eyebrow>
            <h2 className="font-display text-2xl text-white">
              Entra na lista de fundadores
            </h2>
            <p className="font-sans text-sm text-silver">
              Ebook liberado assim que você se cadastra — sem cartão, sem checkout.
            </p>
            <CartaoConversao className="p-4 shadow-none sm:p-4">
              {/* QA (feedback da Marina): o microtexto padrão do componente
                  ("Grátis. Sem cartão...") repetia o parágrafo acima e, pior,
                  soa como se o EBOOK fosse grátis — ele é vendido; o que é
                  grátis é entrar na lista. Suprimido aqui pra não reforçar
                  essa leitura errada; o parágrafo acima já cobre o recado. */}
              <ListaFundadorasForm origem="ebook" microtexto="" />
            </CartaoConversao>
          </Card>

          <Card variant="ghost" className="flex flex-col gap-4 p-6">
            <Eyebrow dark>Caminho 2 — compra avulsa</Eyebrow>
            <h2 className="font-display text-2xl text-white">
              Comprar só o ebook
            </h2>
            <p className="font-sans text-3xl text-fire">[PREÇO A DEFINIR]</p>
            <p className="font-sans text-sm text-silver">
              Pra quem não quer entrar na lista agora, mas quer o guia já.
            </p>
            <Button variant="ghost" className="mt-2 cursor-not-allowed opacity-60" disabled>
              [checkout a integrar]
            </Button>
            <p className="font-sans text-xs text-silver/70">
              O checkout de pagamento ainda não está integrado nesta fase do produto —
              nenhuma cobrança é feita ao clicar.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Compromisso / FAQ honesto */}
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Eyebrow>Nosso compromisso</Eyebrow>
        <p className="mt-3 font-sans text-sm leading-relaxed text-mid">
          O Run Again está em construção. Não vamos te vender uma garantia de
          resultado que não podemos sustentar ainda — o que garantimos é que este guia
          passa pelas mãos de quem tem 16 anos de fisioterapia clínica.
        </p>

        <h2 className="mt-10 font-display text-2xl text-ink">Perguntas frequentes</h2>
        <div className="mt-4 flex flex-col divide-y divide-mid/15">
          {faq.map((item) => (
            <details key={item.pergunta} className="py-4 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none font-sans text-sm font-bold text-ink marker:content-none">
                {item.pergunta}
              </summary>
              <p className="mt-2 font-sans text-sm leading-relaxed text-mid">
                {item.resposta}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. CTA final */}
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
          <h2 className="font-display text-4xl text-white sm:text-5xl">
            Volta de olhos abertos.
          </h2>
          <CartaoConversao>
            {/* QA (feedback da Marina): mesmo ajuste da seção "Caminho 1" —
                sem microtexto próprio, o padrão do componente ("Grátis. Sem
                cartão...") lia como se o ebook (produto vendido) fosse
                grátis. Este CTA final é o mesmo caminho gratuito da lista de
                fundadores — o texto abaixo deixa isso explícito, sem usar a
                palavra "grátis" solta perto do nome do ebook. */}
            <ListaFundadorasForm
              origem="ebook"
              ctaLabel="Quero o ebook Corrida sem Lesão"
              microtexto="Isso te coloca na lista de fundadores — o ebook é o bônus de quem entra, sem cartão."
            />
          </CartaoConversao>
        </div>
      </section>
    </main>
  );
}
