"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressoAvaliacao } from "@/components/avaliacao/PassoChrome";
import { OnboardingIntro } from "./passos/OnboardingIntro";
import { OnboardingSensivel } from "./passos/OnboardingSensivel";
import { BlocoBiometriaForm } from "./passos/BlocoBiometriaForm";
import { BlocoObjetivoForm } from "./passos/BlocoObjetivoForm";
import { BlocoAlimentarForm } from "./passos/BlocoAlimentarForm";
import { BlocoDigestivoForm } from "./passos/BlocoDigestivoForm";
import { BlocoSuplementosForm } from "./passos/BlocoSuplementosForm";
import { BlocoComportamentoForm } from "./passos/BlocoComportamentoForm";
import { BlocoSaudeMenstrualForm } from "./passos/BlocoSaudeMenstrualForm";
import { ConcluindoStep } from "./passos/ConcluindoStep";
import type {
  BlocoAlimentar,
  BlocoBiometria,
  BlocoComportamento,
  BlocoDigestivo,
  BlocoObjetivo,
  BlocoSaudeMenstrual,
  BlocoSuplementos,
  RespostasAvaliacaoNutricao,
} from "@/lib/nutricao/types";

export type PassoChaveAvaliacaoNutricao =
  | "intro"
  | "blocoBiometria"
  | "blocoObjetivo"
  | "blocoAlimentar"
  | "blocoDigestivo"
  | "blocoSuplementos"
  | "onboardingSensivel"
  | "blocoComportamento"
  | "blocoSaudeMenstrual"
  | "concluindo";

function montarSequencia(mostrarSaudeMenstrual: boolean): PassoChaveAvaliacaoNutricao[] {
  const base: PassoChaveAvaliacaoNutricao[] = [
    "intro",
    "blocoBiometria",
    "blocoObjetivo",
    "blocoAlimentar",
    "blocoDigestivo",
    "blocoSuplementos",
    "onboardingSensivel",
    "blocoComportamento",
  ];
  if (mostrarSaudeMenstrual) base.push("blocoSaudeMenstrual");
  base.push("concluindo");
  return base;
}

export interface AvaliacaoNutricionalWizardProps {
  passoInicial: PassoChaveAvaliacaoNutricao;
  respostas: RespostasAvaliacaoNutricao;
}

export function AvaliacaoNutricionalWizard({ passoInicial, respostas: respostasIniciais }: AvaliacaoNutricionalWizardProps) {
  const [respostas, setRespostas] = useState<RespostasAvaliacaoNutricao>(respostasIniciais);
  const mostrarSaudeMenstrual = respostas.blocoBiometria?.sexoBiologico === "feminino";
  const sequencia = useMemo(() => montarSequencia(mostrarSaudeMenstrual), [mostrarSaudeMenstrual]);

  const indiceInicial = Math.max(sequencia.indexOf(passoInicial), 0);
  const [indice, setIndice] = useState(indiceInicial);
  const passo = sequencia[indice] ?? "concluindo";

  const avancar = () => setIndice((i) => Math.min(i + 1, sequencia.length - 1));
  const voltar = () => setIndice((i) => Math.max(1, i - 1));

  function salvarESeguir<K extends keyof RespostasAvaliacaoNutricao>(chave: K, valores: RespostasAvaliacaoNutricao[K]) {
    setRespostas((r) => ({ ...r, [chave]: valores }));
    avancar();
  }

  const totalMedido = sequencia.filter((p) => p !== "intro" && p !== "onboardingSensivel" && p !== "concluindo").length;
  const passoMedido = sequencia.slice(0, indice + 1).filter((p) => p !== "intro" && p !== "onboardingSensivel" && p !== "concluindo").length;
  const mostrarProgresso = passo !== "intro" && passo !== "concluindo";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {mostrarProgresso && <ProgressoAvaliacao atual={passoMedido} total={totalMedido} />}

      <Card variant="pillar" className="p-6 sm:p-8">
        {passo === "intro" && <OnboardingIntro onNext={avancar} />}
        {passo === "blocoBiometria" && (
          <BlocoBiometriaForm valoresIniciais={respostas.blocoBiometria} onSalvo={(v: BlocoBiometria) => salvarESeguir("blocoBiometria", v)} />
        )}
        {passo === "blocoObjetivo" && (
          <BlocoObjetivoForm valoresIniciais={respostas.blocoObjetivo} onSalvo={(v: BlocoObjetivo) => salvarESeguir("blocoObjetivo", v)} />
        )}
        {passo === "blocoAlimentar" && (
          <BlocoAlimentarForm valoresIniciais={respostas.blocoAlimentar} onSalvo={(v: BlocoAlimentar) => salvarESeguir("blocoAlimentar", v)} />
        )}
        {passo === "blocoDigestivo" && (
          <BlocoDigestivoForm valoresIniciais={respostas.blocoDigestivo} onSalvo={(v: BlocoDigestivo) => salvarESeguir("blocoDigestivo", v)} />
        )}
        {passo === "blocoSuplementos" && (
          <BlocoSuplementosForm valoresIniciais={respostas.blocoSuplementos} onSalvo={(v: BlocoSuplementos) => salvarESeguir("blocoSuplementos", v)} />
        )}
        {passo === "onboardingSensivel" && <OnboardingSensivel onNext={avancar} />}
        {passo === "blocoComportamento" && (
          <BlocoComportamentoForm valoresIniciais={respostas.blocoComportamento} onSalvo={(v: BlocoComportamento) => salvarESeguir("blocoComportamento", v)} />
        )}
        {passo === "blocoSaudeMenstrual" && (
          <BlocoSaudeMenstrualForm valoresIniciais={respostas.blocoSaudeMenstrual} onSalvo={(v: BlocoSaudeMenstrual) => salvarESeguir("blocoSaudeMenstrual", v)} />
        )}
        {passo === "concluindo" && <ConcluindoStep />}
      </Card>

      {passo !== "intro" && passo !== "onboardingSensivel" && passo !== "concluindo" && indice > 1 && (
        <button
          type="button"
          onClick={voltar}
          className="self-center text-sm font-sans text-mid hover:text-ink hover:underline"
        >
          ← Voltar
        </button>
      )}
    </div>
  );
}
