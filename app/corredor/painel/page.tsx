import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/estados/EmptyState";
import { HeroPainel } from "@/components/painel/HeroPainel";
import { CardAderencia } from "@/components/painel/CardAderencia";
import { CardCargaForma } from "@/components/painel/CardCargaForma";
import { CardRisco } from "@/components/painel/CardRisco";
import { CardBemEstar } from "@/components/painel/CardBemEstar";
import { CardHistorico } from "@/components/painel/CardHistorico";
import { GradePilares } from "@/components/painel/GradePilares";
import { OnboardingPainel } from "@/components/painel/OnboardingPainel";
import { getSessao } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacaoAtual } from "@/lib/avaliacao/queries";
import { estados } from "@/lib/avaliacao/copy";
import { getAtendimentoIniciadoResultado, getHistoricoAtendimentosCorredorResultado } from "@/lib/fisioterapia/queries";
import { getAderenciaResultado, getPerfilPainel, getRespostas24hResultado } from "@/lib/painel/queries";
import { getResumoBemEstar } from "@/lib/psicologia/queries";
import {
  algumSinalDeAtencao,
  calcularRiscoAtualizado,
  cargaVidaDoBlocoF,
  montarCargaForma,
  riscoPrimeiroQueCargaForma,
} from "@/lib/painel/calculo";
import type { CargaFormaResumo, ResultadoPainel, RiscoResumo } from "@/lib/painel/types";
import { elegibilidadeAderencia, elegibilidadeCargaForma, elegibilidadeRisco } from "@/lib/comunidade/calculo";
import { aindaNaoCompartilhada, getChavesJaCompartilhadas } from "@/lib/comunidade/queries";

export const metadata: Metadata = { title: "Painel — Run Again" };

export default async function PainelCorredorPage() {
  const sessao = await getSessao();

  // O middleware já bloqueia isto quando persona é nula (RF07-CA1 do Fluxo
  // 2) — checagem redundante de propósito (defesa em profundidade, mesmo
  // padrão de app/corredor/layout.tsx).
  if (!sessao?.persona) {
    redirect("/corredor/comecar");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const avaliacao = await getAvaliacaoAtual(user.id);
  const diagnosticoPronto = !!avaliacao?.concluida_em && !!avaliacao.banda_risco && avaliacao.risco_score !== null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Eyebrow>ÁREA DO CORREDOR</Eyebrow>
        <h1 className="mt-1 font-display text-3xl text-ink">Oi, {sessao.nome.split(" ")[0]}.</h1>
      </div>

      {!diagnosticoPronto ? (
        <PainelSemDiagnostico avaliacaoIniciada={!!avaliacao} userId={user.id} />
      ) : (
        <PainelComDiagnostico userId={user.id} avaliacao={avaliacao} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Antes do diagnóstico existir — RF07-CA3: CTA pra concluir a avaliação, não
// os atalhos de painel (sem dado nenhum pra sustentar hero/aderência/risco/
// bem-estar ainda).
// ---------------------------------------------------------------------------

function PainelSemDiagnostico({ avaliacaoIniciada, userId }: { avaliacaoIniciada: boolean; userId: string }) {
  const copy = avaliacaoIniciada ? estados.vazioPainelAvaliacaoIncompleta : estados.vazioPainelSemDiagnostico;

  return (
    <div className="flex flex-col gap-6">
      <EmptyState
        titulo={copy.titulo}
        subtitulo={copy.subtitulo}
        ctaLabel={copy.cta}
        ctaHref="/corredor/comecar"
        className="p-8 text-center"
      />

      <Link href="/corredor/minha-recuperacao">
        <Card variant="pillar" className="flex flex-col gap-2 transition-shadow hover:shadow-md">
          <Badge>TREINO</Badge>
          <h2 className="font-display text-2xl text-ink">Treinos recomendados</h2>
          <p className="text-sm font-sans text-mid">Sua sessão prescrita e a evolução real do seu retorno, em número.</p>
        </Card>
      </Link>

      <GradePilares userId={userId} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Depois do diagnóstico — o painel de progresso completo (RF03–RF09).
//
// RF10 (onboarding) só entra aqui dentro, nunca antes do diagnóstico existir:
// a tela de onboarding fala sobre aderência/carga/risco/forma, conceitos que
// não existem enquanto PainelSemDiagnostico está ativo — mostrá-la mais cedo
// explicaria uma tela que a Returnista ainda não pode ver. Corresponde à
// dependência já registrada no PRD (§10.2): "RF10 depende de RF03–RF09
// estarem renderizando".
// ---------------------------------------------------------------------------

async function PainelComDiagnostico({
  userId,
  avaliacao,
}: {
  userId: string;
  avaliacao: NonNullable<Awaited<ReturnType<typeof getAvaliacaoAtual>>>;
}) {
  const perfilPainel = await getPerfilPainel(userId);

  // RF10 — onboarding de uma tela, uma única vez, antes de qualquer card.
  if (!perfilPainel?.viuOnboarding) {
    return <OnboardingPainel />;
  }

  const [
    respostasResultado,
    aderenciaResultado,
    historicoResultado,
    resumoBemEstar,
    chavesJaCompartilhadas,
    atendimentoIniciadoResultado,
  ] = await Promise.all([
    getRespostas24hResultado(userId),
    getAderenciaResultado(userId),
    getHistoricoAtendimentosCorredorResultado(),
    getResumoBemEstar(userId, avaliacao),
    getChavesJaCompartilhadas(userId),
    getAtendimentoIniciadoResultado(userId),
  ]);

  // Feedback da Marina — lado seguro em caso de erro de leitura: assume que
  // a avaliação profissional ainda NÃO aconteceu (nunca o contrário), tanto
  // pro card de risco quanto pro hero de status do dia.
  const atendimentoIniciado = atendimentoIniciadoResultado.ok ? atendimentoIniciadoResultado.data : false;

  const respostas = respostasResultado.ok ? respostasResultado.data : [];

  // RF05-CA1 — carga de vida é sempre a fonte mais recente: resposta 24h se
  // existir, senão o Bloco F do diagnóstico (regra §6.4).
  const cargaVidaFallback = cargaVidaDoBlocoF(avaliacao.respostas.blocoF?.desafioRotina);
  const cargaFormaResultado: ResultadoPainel<CargaFormaResumo | null> = respostasResultado.ok
    ? {
        ok: true,
        data: montarCargaForma({
          respostasRecentes: respostas.slice(0, 5),
          cargaVidaFallbackDiagnostico: cargaVidaFallback,
        }),
      }
    : { ok: false };

  const zonasAmarelas = respostas.filter((r) => r.zona === "amarela").length;
  const zonasVermelhas = respostas.filter((r) => r.zona === "vermelha").length;
  const aderenciaPercentual = aderenciaResultado.ok ? (aderenciaResultado.data?.percentual ?? null) : null;

  const riscoResultado: ResultadoPainel<RiscoResumo> = respostasResultado.ok
    ? {
        ok: true,
        data: calcularRiscoAtualizado({
          scoreInicial: avaliacao.risco_score as number,
          bandaInicial: avaliacao.banda_risco!,
          zonasAmarelas,
          zonasVermelhas,
          aderenciaPercentual,
          temDadoNovo: respostas.length > 0,
        }),
      }
    : { ok: false };

  // RF01 da Comunidade — convite inline nos 3 cards de evidência elegível
  // que vivem nesta página (o 4º, insight, mora em minha-recuperacao/
  // evolucao/page.tsx). aindaNaoCompartilhada devolve null tanto quando a
  // leitura não é elegível quanto quando ela já foi compartilhada.
  // Sem atendimento iniciado, o card de risco não mostra banda nenhuma
  // (CardRisco), então também não faz sentido oferecer "compartilhar" uma
  // leitura que nem apareceu de verdade.
  const compartilharRisco = atendimentoIniciado
    ? aindaNaoCompartilhada(elegibilidadeRisco(riscoResultado), chavesJaCompartilhadas, "risco")
    : null;
  const compartilharCargaForma = aindaNaoCompartilhada(
    elegibilidadeCargaForma(cargaFormaResultado),
    chavesJaCompartilhadas,
    "carga_forma",
  );
  const compartilharAderencia = aindaNaoCompartilhada(
    elegibilidadeAderencia(aderenciaResultado),
    chavesJaCompartilhadas,
    "aderencia",
  );

  // Hierarquia visual (auditoria de design, 2026-09): quando risco ou
  // carga/forma pede atenção, esse par sobe pra logo depois do hero — é
  // continuação do mesmo sinal, não mais uma métrica na grade. Aderência
  // nunca disputa essa posição (regra §6.1: nunca vira cobrança visual).
  const parCargaRisco = riscoPrimeiroQueCargaForma(riscoResultado, cargaFormaResultado)
    ? [
        <CardRisco key="risco" resultado={riscoResultado} compartilhar={compartilharRisco} atendimentoIniciado={atendimentoIniciado} />,
        <CardCargaForma key="carga" resultado={cargaFormaResultado} compartilhar={compartilharCargaForma} />,
      ]
    : [
        <CardCargaForma key="carga" resultado={cargaFormaResultado} compartilhar={compartilharCargaForma} />,
        <CardRisco key="risco" resultado={riscoResultado} compartilhar={compartilharRisco} atendimentoIniciado={atendimentoIniciado} />,
      ];
  const cartaoAderencia = <CardAderencia key="aderencia" resultado={aderenciaResultado} compartilhar={compartilharAderencia} />;
  const cartaoBemEstar = (
    <CardBemEstar
      key="bem-estar"
      frase={resumoBemEstar.frase}
      zona={resumoBemEstar.zona}
      ehLeituraInicial={resumoBemEstar.ehLeituraInicial}
    />
  );
  const cardsOrdenados = algumSinalDeAtencao(riscoResultado, cargaFormaResultado)
    ? [...parCargaRisco, cartaoAderencia, cartaoBemEstar]
    : [cartaoAderencia, ...parCargaRisco, cartaoBemEstar];

  return (
    <div className="flex flex-col gap-6">
      <HeroPainel resultado={respostasResultado} atendimentoIniciado={atendimentoIniciado} />

      {/* QA (feedback da Marina): o caminho pra registrar refeição ficava
          escondido dentro do hub de Nutrição (2 cliques + rolar até um link
          de texto pequeno no fim da página). Atalho de destaque logo na
          tela principal do painel, ao lado do atalho equivalente de treino
          (que já existia, mas só dentro do card de aderência). */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button href="/corredor/minha-recuperacao/sessao" variant="primary" className="w-full">
          Registrar treino
        </Button>
        <Button href="/corredor/nutricao/registro" variant="fire-ghost" className="w-full">
          Registrar refeição
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{cardsOrdenados}</div>

      <CardHistorico resultado={historicoResultado} />

      <GradePilares userId={userId} />
    </div>
  );
}
