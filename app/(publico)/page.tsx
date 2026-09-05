import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { PillarCard } from "@/components/marketing/PillarCard";
import { ListaFundadorasForm } from "@/components/marketing/ListaFundadorasForm";
import { CartaoConversao } from "@/components/marketing/CartaoConversao";
import { EmptyState } from "@/components/estados/EmptyState";
import { pilaresProduto } from "@/lib/site/pilares-produto";
import { fundadores, fechamentoQuemSomos } from "@/lib/site/fundadores";
import { pilaresBlog } from "@/lib/blog/pilares";
import { getDestaques } from "@/lib/blog/content";

// Reestruturação de navegação (decisão de produto, 2026-09): o blog vira a
// home de quem não está logado — esta página reúne o que antes vivia
// separado em / (lista de fundadores) e /blog (conteúdo). Nenhuma frase foi
// reescrita ou resumida nas duas fontes — só reordenadas numa página só.
// /blog agora só redireciona pra cá (app/(publico)/blog/page.tsx), pra não
// quebrar link já compartilhado.
export const metadata: Metadata = {
  title: "Run Again — Volte a correr forte, sem se machucar de novo",
  description:
    "Conteúdo, ciência e a lista de fundadores do Run Again — o primeiro ecossistema que junta treino, nutrição e psicologia do esporte numa jornada só.",
};

const beneficios = [
  "Você volta a treinar forte sem o medo de se machucar de novo — porque o protocolo já entra considerando a carga real da sua rotina, não só do seu treino.",
  "Você entende, pela primeira vez, sua “carga de vida” — os passos do trabalho, o estresse do dia, o sono maldormido — tudo isso entra na conta do seu plano.",
  "Você tem treino, nutrição e psicologia do esporte no mesmo lugar, falando a mesma língua — em vez de profissionais que nunca se conversam entre si.",
  "Você trata o medo de se machucar de novo como parte do trabalho, não como fraqueza — com acompanhamento de psicologia do esporte que nenhum concorrente oferece.",
  "Você para de pedir desculpa por levar a corrida a sério. Ambição num hobby deixa de ser motivo de culpa.",
];

const provas = [
  {
    titulo: "Protocolo de atleta, e mais",
    texto:
      "O amador é tratado com o mesmo rigor de um profissional patrocinado — só que sem o luxo de descansar por obrigação.",
  },
  {
    titulo: "A vida inteira entra no cálculo",
    texto: "Até os passos que você dá no trabalho contam pro seu volume da semana.",
  },
  {
    titulo: "Ciência aplicada + vivência real",
    texto:
      "16 anos de fisioterapia clínica assinando os protocolos, e alguém que viveu a lesão, o medo e a volta liderando o produto.",
  },
];

const errosDoMercado = [
  {
    titulo: "Os que empilham sem critério",
    texto:
      "Assessorias que validam qualquer meta e só sobem o volume de km por semana, sem fortalecimento, sem olhar pra sua vida fora do treino.",
  },
  {
    titulo: "Os que esperam ser procurados",
    texto:
      "Treinadores reativos: “se me perguntar, eu falo”. Não te levam pro próximo patamar porque isso exigiria um trabalho que ninguém está cobrando deles.",
  },
  {
    titulo: "Os que romantizam o sofrimento",
    texto:
      "Corredores-referência que usam a própria dor como critério de exclusão: “se você não sofreu como eu sofri, não vai chegar lá”. Desencorajam mais do que inspiram.",
  },
];

// Terminologia e reconciliação da lista de fundadores (decisão de produto,
// 2026-09): a lista serve exclusivamente pra receber novidades e conteúdo
// por e-mail — nunca promete vaga, prioridade de fila ou acesso antecipado
// ao beta (isso continua sendo só pra quem compra um infoproduto). Os dois
// itens que prometiam isso ("prioridade de acesso quando o app abrir",
// "preço de fundador travado") saíram desta lista.
const oferta = [
  "Ebook “Corrida sem Lesão” de bônus, liberado assim que você entra na lista (valor percebido: R$47).",
  "Conteúdo dos bastidores da construção do produto, direto no seu e-mail — antes do lançamento público.",
  "Novidades do Run Again sempre que tiver algo real pra contar. Sem spam, sem promessa de vaga.",
];

const faq = [
  {
    pergunta: "Isso é só mais um app de treino?",
    resposta:
      "Não. Um app de treino te dá uma planilha de km. O Run Again junta treino, nutrição e psicologia do esporte na mesma jornada — porque o que evita lesão não é só quanto você corre, é como sua vida inteira sustenta esse treino.",
  },
  {
    pergunta: "Preciso ser atleta de verdade pra usar?",
    resposta:
      "Não. O Run Again foi criado por um corredor amador, pra corredores amadores. Você não precisa de currículo esportivo — precisa querer treinar com inteligência.",
  },
  {
    pergunta: "Quando o app lança?",
    resposta:
      "Estamos na fase de construção e teste com um grupo seleto. Quem está na lista de fundadores é avisado em primeira mão, antes de qualquer anúncio público.",
  },
  {
    pergunta: "O que acontece depois que eu entro na lista?",
    resposta:
      "Você recebe o ebook Corrida sem Lesão na hora, e passa a receber os bastidores da construção do produto e as novidades do Run Again direto no seu e-mail.",
  },
  {
    pergunta: "Vou ser cobrada por entrar na lista?",
    resposta:
      "Não. Entrar na lista é grátis e não pede cartão — é só pra você receber novidades e conteúdo do Run Again por e-mail.",
  },
];

export default function LandingPage() {
  const destaques = getDestaques();

  return (
    <>
      {/* 1. Hero */}
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">
          <div>
            <Eyebrow dark>Lista de fundadores · novidades por e-mail</Eyebrow>
            <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-tight text-white sm:text-6xl">
              Volte a correr forte — <span className="text-fire">sem se machucar de novo</span>.
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-silver">
              O primeiro ecossistema que junta treino, nutrição e
              psicologia do esporte numa jornada só — criado por quem viveu o
              medo de voltar, e assinado por quem trata corredores há 16 anos.
            </p>
          </div>

          <CartaoConversao>
            <ListaFundadorasForm origem="hero" />
          </CartaoConversao>

          <Link href="/login" className="text-sm font-sans text-silver hover:text-white hover:underline">
            Já tem um convite? Entrar
          </Link>
        </div>
      </section>

      {/* 2. A cena (dor) */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>A cena que você conhece</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Você olha pro tênis parado no canto e pensa duas vezes antes de calçar.
        </h2>
        <p className="mt-5 font-sans text-base leading-relaxed text-mid">
          Faz duas semanas, dois meses ou dois anos desde a sua última corrida — e o
          número não importa, porque o medo é sempre do mesmo tamanho. Não é preguiça. É
          a lembrança do estalo no joelho, da fisioterapia que tratou o sintoma e não a
          causa, do dia em que alguém disse “eu avisei que você tava exagerando”.
        </p>
        <p className="mt-4 font-sans text-base leading-relaxed text-mid">
          Só que ninguém te contou o outro lado: hobby não tem teto. Dá pra levar a
          corrida a sério — treinar forte, ter meta, querer evoluir — sem isso ser
          exagero.
        </p>

        <Card variant="insight" className="mt-8">
          <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">
            Você não se machucou por pedir demais do seu corpo. Se machucou porque
            ninguém te preparou pro tamanho da sua ambição.
          </p>
        </Card>
      </section>

      {/* 3. Quem somos */}
      <section className="bg-smoke px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Quem somos</Eyebrow>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Duas pessoas que já passaram pelos dois lados dessa história.
          </h2>

          <div className="mt-10 flex flex-col gap-10">
            {/* Foto oficial pendente — ver TODO no PR. Usar iniciais até lá,
                nunca foto de banco de imagens genérica (nota de produção
                da copy de home). */}
            {fundadores.map((fundador) => (
              <div key={fundador.nome} className="flex flex-col gap-4 sm:flex-row">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-fire-dim font-display text-2xl text-fire-text"
                  aria-hidden="true"
                >
                  {fundador.inicial}
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink">
                    {fundador.nome} — {fundador.papel}
                  </h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-mid">
                    {fundador.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 font-sans text-base leading-relaxed text-ink">
            {fechamentoQuemSomos}
          </p>
        </div>
      </section>

      {/* 4. O produto como solução */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>A solução que faltava</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          O Run Again é o cuidado que devia existir desde a sua primeira corrida.
        </h2>
        <p className="mt-5 font-sans text-base leading-relaxed text-mid">
          Nenhum concorrente integra treino, nutrição e
          psicologia do esporte numa jornada só. O Run Again junta as cinco
          coisas que realmente evitam lesão e sustentam evolução — com protocolos
          validados clinicamente, adaptados à sua rotina real, não a uma planilha
          genérica de quilômetros.
        </p>

        <Card variant="insight" className="mt-8 text-center">
          <p className="font-display text-2xl text-ink sm:text-3xl">
            Cuidado não é pegar leve. É pegar certo.
          </p>
        </Card>
      </section>

      {/* 5. Os 5 pilares */}
      <section className="bg-paper px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Eyebrow className="text-center">O ecossistema</Eyebrow>
          <h2 className="mt-2 text-center font-display text-3xl text-ink sm:text-4xl">
            Os 5 pilares
          </h2>

          {/* flex + wrap em vez de grid: com 5 pilares (ímpar em relação às 3
              colunas do desktop), um grid deixaria a última linha alinhada à
              esquerda com um espaço vazio no lugar do card removido de
              Medicina do Esporte. Flex-wrap + justify-center centraliza essa
              última linha incompleta em vez de deixar o buraco. */}
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            {pilaresProduto.map((pilar) => (
              <PillarCard
                key={pilar.slug}
                emoji={pilar.emoji}
                nome={pilar.nome}
                descricao={pilar.descricaoCurta}
                className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5b. Blog — antes vivia isolado em /blog, agora é parte da home
          (decisão de produto, reestruturação de navegação 2026-09). Mesmo
          conteúdo/copy de app/(publico)/blog/page.tsx, sem parafrasear. */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Eyebrow>Destaques</Eyebrow>
        <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
          O que ler primeiro
        </h2>

        {destaques.length === 0 ? (
          <EmptyState
            className="mt-6"
            subtitulo="Ainda estamos publicando os primeiros artigos. Enquanto isso, explora os pilares abaixo ou entra na lista de fundadores pra saber quando sair o primeiro."
          />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {destaques.map((artigo) => (
              <Link key={`${artigo.pilar}/${artigo.slug}`} href={`/blog/${artigo.pilar}/${artigo.slug}`}>
                <Card variant="pillar" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-md">
                  <h3 className="font-display text-xl text-ink">{artigo.titulo}</h3>
                  <p className="text-sm font-sans text-mid">{artigo.resumo}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-paper px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Eyebrow>Navegue por pilar</Eyebrow>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">
            Escolha o assunto
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pilaresBlog.map((pilar) => (
              <Link key={pilar.slug} href={`/blog/${pilar.slug}`}>
                <Card variant="pillar" className="flex h-full flex-col gap-2 transition-shadow hover:shadow-md">
                  <h3 className="font-display text-xl text-ink">{pilar.nome}</h3>
                  <p className="text-sm font-sans text-mid">{pilar.descricao}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Benefícios */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>O que muda pra você</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          O que você conquista dentro do Run Again
        </h2>

        <ul className="mt-8 flex flex-col gap-5">
          {beneficios.map((texto, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-fire" aria-hidden="true" />
              <p className="font-sans text-base leading-relaxed text-mid">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Prova / por que confiar */}
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Eyebrow dark>Por que confiar</Eyebrow>
          <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            Isso não é discurso de lançamento.
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {provas.map((prova) => (
              <Card key={prova.titulo} variant="ghost" className="p-6">
                <h3 className="font-display text-xl text-white">{prova.titulo}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-silver">
                  {prova.texto}
                </p>
              </Card>
            ))}
          </div>

          <Card variant="ghost" className="mt-5 p-8 text-center">
            <p className="font-display text-3xl text-fire sm:text-4xl">7 em cada 10</p>
            <p className="mx-auto mt-2 max-w-xl font-sans text-sm leading-relaxed text-silver">
              No Brasil, 7 em cada 10 corredores se lesionam todo ano — e a maioria
              volta a treinar do mesmo jeito que se machucou da primeira vez.
            </p>
          </Card>
        </div>
      </section>

      {/* 8. Como o mercado erra */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>Por que o resto do mercado não resolve</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Você já deve ter esbarrado num desses três.
        </h2>

        <ul className="mt-8 flex flex-col divide-y divide-mid/15">
          {errosDoMercado.map((erro) => (
            <li key={erro.titulo} className="py-6 first:pt-0 last:pb-0">
              <h3 className="font-sans text-base font-bold text-ink">{erro.titulo}</h3>
              <p className="mt-1 font-sans text-sm leading-relaxed text-mid">{erro.texto}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 font-sans text-base font-semibold text-ink">
          O Run Again nasceu pra ser o oposto dos três.
        </p>
      </section>

      {/* 9. CTA intermediário */}
      <section className="bg-ink-2 px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
            Ainda não dá pra assinar o Run Again — mas dá pra ficar por dentro
            de tudo antes de todo mundo.
          </h2>
          <CartaoConversao>
            <ListaFundadorasForm
              origem="cta-intermediario"
              ctaLabel="Quero receber novidades do Run Again"
            />
          </CartaoConversao>
        </div>
      </section>

      {/* 10. Oferta — o que você recebe entrando pra lista */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>O que você recebe</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          O que você recebe entrando pra lista agora
        </h2>

        <ol className="mt-8 flex flex-col gap-6">
          {oferta.map((texto, i) => (
            <li key={i} className="flex gap-5">
              <span className="w-8 shrink-0 font-display text-3xl text-fire-text" aria-hidden="true">
                {i + 1}
              </span>
              <p className="font-sans text-base leading-relaxed text-mid">{texto}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 font-sans text-base font-semibold text-ink">
          R$0 hoje. Sem cartão. Só pra receber novidades e conteúdo do Run Again por
          e-mail.
        </p>
      </section>

      {/* 11. Nosso compromisso (substitui a garantia) */}
      <section className="bg-smoke px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Nosso compromisso</Eyebrow>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Não vamos prometer o que ainda não testamos em escala.
          </h2>
          <p className="mt-5 font-sans text-base leading-relaxed text-mid">
            O Run Again está em construção. Isso significa que não vamos te vender uma
            garantia de resultado que não podemos sustentar ainda. O que garantimos é
            isto: todo protocolo que sair daqui passa pelas mãos de quem tem 16
            anos de fisioterapia clínica, e todo conteúdo é decidido por quem já viveu,
            na pele, o medo de voltar a correr. Entrar na lista não custa nada e não te
            compromete com nada — é só garantir que, quando abrirmos, você seja uma das
            primeiras a saber.
          </p>
        </div>
      </section>

      {/* 12. Perguntas frequentes */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Eyebrow>Perguntas frequentes</Eyebrow>
        <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Antes de entrar, tira suas dúvidas.
        </h2>

        <div className="mt-8 flex flex-col divide-y divide-mid/15">
          {faq.map((item) => (
            <details key={item.pergunta} className="py-5 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none font-sans text-base font-bold text-ink marker:content-none">
                {item.pergunta}
              </summary>
              <p className="mt-2 font-sans text-sm leading-relaxed text-mid">
                {item.resposta}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 13. Urgência (genuína) */}
      <section className="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
        <Card variant="insight">
          <p className="font-sans text-sm leading-relaxed text-ink">
            Estamos testando o Run Again com um grupo pequeno de propósito — é assim
            que cada protocolo sai validado, não só bonito no papel. A lista de
            fundadores não é fila de espera pro beta: é o jeito mais direto de saber,
            assim que tivermos novidade real pra contar.
          </p>
        </Card>
      </section>

      {/* 14. CTA final */}
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
          <div>
            <h2 className="font-display text-5xl text-white sm:text-6xl">
              É hora de <span className="text-fire">correr</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-silver">
              De novo — dessa vez com alguém do seu lado, e sem pedir desculpa por
              querer mais.
            </p>
          </div>
          <CartaoConversao>
            <ListaFundadorasForm origem="cta-final" ctaLabel="Quero receber novidades do Run Again" />
          </CartaoConversao>
        </div>
      </section>
    </>
  );
}
