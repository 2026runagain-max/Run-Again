"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressoAvaliacao } from "./PassoChrome";
import { IntroStep } from "./passos/IntroStep";
import { ConsentStep } from "./passos/ConsentStep";
import { PersonaStep } from "./passos/PersonaStep";
import { BlocoAForm } from "./passos/BlocoAForm";
import { BlocoBForm } from "./passos/BlocoBForm";
import { BlocoCForm } from "./passos/BlocoCForm";
import { BlocoDForm } from "./passos/BlocoDForm";
import { BlocoEForm } from "./passos/BlocoEForm";
import { BlocoFForm } from "./passos/BlocoFForm";
import { BlocoGForm } from "./passos/BlocoGForm";
import { BlocoHForm } from "./passos/BlocoHForm";
import { ConcluindoStep } from "./passos/ConcluindoStep";
import type { Persona } from "@/lib/types";
import type {
  BlocoA,
  BlocoB,
  BlocoC,
  BlocoD,
  BlocoE,
  BlocoF,
  BlocoG,
  BlocoH,
  RespostasAvaliacao,
} from "@/lib/avaliacao/types";

const TOTAL_PASSOS_MEDIDOS = 9; // persona + 8 blocos

export interface AvaliacaoWizardProps {
  passoInicial: number;
  personaAtual: Persona | null;
  respostas: RespostasAvaliacao;
}

export function AvaliacaoWizard({ passoInicial, personaAtual, respostas: respostasIniciais }: AvaliacaoWizardProps) {
  const [passo, setPasso] = useState(passoInicial);
  const [persona, setPersona] = useState(personaAtual);
  // Espelha localmente o que cada bloco acabou de salvar — sem isto,
  // clicar em "Voltar" pra revisar um bloco preenchido nesta mesma sessão
  // mostraria o formulário vazio (os valores iniciais só refletem o que
  // existia no banco antes desta sessão de edição começar).
  const [respostas, setRespostas] = useState<RespostasAvaliacao>(respostasIniciais);

  const avancar = () => setPasso((p) => p + 1);
  const voltar = () => setPasso((p) => Math.max(2, p - 1));

  function salvarESeguir<K extends keyof RespostasAvaliacao>(chave: K, valores: RespostasAvaliacao[K]) {
    setRespostas((r) => ({ ...r, [chave]: valores }));
    avancar();
  }

  const mostrarProgresso = passo >= 2 && passo <= 10;
  const passoMedido = passo - 1; // persona=1..blocoH=9

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {mostrarProgresso && <ProgressoAvaliacao atual={passoMedido} total={TOTAL_PASSOS_MEDIDOS} />}

      <Card variant="pillar" className="p-6 sm:p-8">
        {passo === 0 && <IntroStep onNext={avancar} />}
        {passo === 1 && <ConsentStep onNext={avancar} />}
        {passo === 2 && (
          <PersonaStep
            valorInicial={persona}
            onNext={(novaPersona) => {
              // Persona precisa estar disponível de imediato pra ramificar a
              // copy de E2 (RF02-CA3) sem esperar um novo carregamento de
              // página — por isso o valor selecionado também vira estado
              // local aqui, além de já ter sido salvo no servidor.
              setPersona(novaPersona);
              avancar();
            }}
          />
        )}
        {passo === 3 && (
          <BlocoAForm valoresIniciais={respostas.blocoA} onSalvo={(v: BlocoA) => salvarESeguir("blocoA", v)} />
        )}
        {passo === 4 && (
          <BlocoBForm valoresIniciais={respostas.blocoB} onSalvo={(v: BlocoB) => salvarESeguir("blocoB", v)} />
        )}
        {passo === 5 && (
          <BlocoCForm valoresIniciais={respostas.blocoC} onSalvo={(v: BlocoC) => salvarESeguir("blocoC", v)} />
        )}
        {passo === 6 && (
          <BlocoDForm valoresIniciais={respostas.blocoD} onSalvo={(v: BlocoD) => salvarESeguir("blocoD", v)} />
        )}
        {passo === 7 && (
          <BlocoEForm
            valoresIniciais={respostas.blocoE}
            persona={persona}
            onSalvo={(v: BlocoE) => salvarESeguir("blocoE", v)}
          />
        )}
        {passo === 8 && (
          <BlocoFForm valoresIniciais={respostas.blocoF} onSalvo={(v: BlocoF) => salvarESeguir("blocoF", v)} />
        )}
        {passo === 9 && (
          <BlocoGForm valoresIniciais={respostas.blocoG} onSalvo={(v: BlocoG) => salvarESeguir("blocoG", v)} />
        )}
        {passo === 10 && (
          <BlocoHForm valoresIniciais={respostas.blocoH} onSalvo={(v: BlocoH) => salvarESeguir("blocoH", v)} />
        )}
        {passo === 11 && <ConcluindoStep />}
      </Card>

      {passo >= 3 && passo <= 10 && (
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
