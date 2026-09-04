"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/estados/LoadingState";
import { concluirAvaliacaoNutricionalAction } from "@/lib/nutricao/actions";
import { estados } from "@/lib/nutricao/copy";

export function ConcluindoStep() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;

    concluirAvaliacaoNutricionalAction().then((resultado) => {
      if (cancelado) return;
      if (!resultado.ok) {
        setErro(resultado.erro);
        return;
      }
      router.push("/corredor/nutricao/minha-orientacao?novo=1");
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tentativa]);

  if (erro) {
    return (
      <div className="rounded-2xl border border-fire/25 bg-fire-dim p-8 text-center" role="alert">
        <h2 className="font-display text-2xl text-ink">{estados.erroCalcular.titulo}</h2>
        <p className="mt-2 font-sans text-sm text-mid">{erro || estados.erroCalcular.subtitulo}</p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => {
            setErro(null);
            setTentativa((t) => t + 1);
          }}
        >
          {estados.erroCalcular.cta}
        </Button>
      </div>
    );
  }

  return <LoadingState subtitulo={estados.loadingCalculando} />;
}
