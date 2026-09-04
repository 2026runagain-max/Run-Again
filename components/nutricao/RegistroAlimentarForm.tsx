"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { registrarAlimentoAction } from "@/lib/nutricao/actions";
import { refeicaoLabel } from "@/lib/nutricao/labels";
import type { RefeicaoTipo } from "@/lib/nutricao/types";

const REFEICOES = Object.keys(refeicaoLabel) as RefeicaoTipo[];

interface ProdutoOff {
  code: string;
  product_name?: string;
  brands?: string;
}

/**
 * RF07-CA1 — busca por alimento consulta a API pública do Open Food Facts
 * direto do client (sem dado sensível envolvido, regra §5 do PRD); alimento
 * não encontrado permite input manual guiado. Debounce simples evita uma
 * requisição por tecla digitada.
 */
function useBuscaOff(termo: string) {
  const [resultados, setResultados] = useState<ProdutoOff[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelado = false;
    const timer = setTimeout(async () => {
      if (cancelado) return;

      if (termo.trim().length < 3) {
        setResultados([]);
        return;
      }

      setBuscando(true);
      setErro(false);
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          termo,
        )}&search_simple=1&action=process&json=1&page_size=8&lc=pt`;
        const resposta = await fetch(url);
        if (!resposta.ok) throw new Error("busca falhou");
        const dados = await resposta.json();
        if (!cancelado) setResultados((dados.products ?? []) as ProdutoOff[]);
      } catch {
        if (!cancelado) setErro(true);
      } finally {
        if (!cancelado) setBuscando(false);
      }
    }, 400);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [termo]);

  return { resultados, buscando, erro };
}

export function RegistroAlimentarForm() {
  const [pending, startTransition] = useTransition();
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [termo, setTermo] = useState("");
  const [selecionado, setSelecionado] = useState<{ fonte: "open_food_facts" | "manual"; nome: string; marca?: string; offCodigo?: string } | null>(null);
  const { resultados, buscando, erro } = useBuscaOff(termo);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErroEnvio(null);
    startTransition(async () => {
      const resultado = await registrarAlimentoAction(null, formData);
      if (!resultado.ok) {
        setErroEnvio(resultado.erro);
        return;
      }
      formRef.current?.reset();
      setTermo("");
      setSelecionado(null);
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-mid/15 bg-white p-6">
      <div>
        <h2 className="font-display text-xl text-ink">Registrar alimento</h2>
        <p className="mt-1 text-sm font-sans text-mid">Nunca obrigatório — registre o que fizer sentido pra você acompanhar.</p>
      </div>

      {!selecionado ? (
        <div className="flex flex-col gap-2">
          <Input
            label="Buscar alimento"
            placeholder="Ex.: arroz integral, banana, whey..."
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />

          {buscando && <p className="text-xs font-sans text-mid">Buscando...</p>}
          {erro && <p className="text-xs font-sans text-mid">Não conseguimos buscar agora — você pode registrar manualmente abaixo.</p>}

          {resultados.length > 0 && (
            <ul className="flex flex-col gap-1 rounded-lg border border-mid/15 p-2">
              {resultados
                .filter((p) => p.product_name)
                .map((p) => (
                  <li key={p.code}>
                    <button
                      type="button"
                      onClick={() => setSelecionado({ fonte: "open_food_facts", nome: p.product_name!, marca: p.brands, offCodigo: p.code })}
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm font-sans text-ink hover:bg-smoke"
                    >
                      {p.product_name}
                      {p.brands && <span className="text-mid"> — {p.brands}</span>}
                    </button>
                  </li>
                ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setSelecionado({ fonte: "manual", nome: termo })}
            className="self-start text-sm font-sans text-fire-text hover:underline"
          >
            Não achei — registrar manualmente
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input type="hidden" name="fonte" value={selecionado.fonte} />
          {selecionado.offCodigo && <input type="hidden" name="offCodigo" value={selecionado.offCodigo} />}

          <Input name="nomeAlimento" label="Alimento" defaultValue={selecionado.nome} required />
          <Input name="marca" label="Marca (opcional)" defaultValue={selecionado.marca} />
          <Input name="porcaoDescricao" label="Porção (opcional)" placeholder="Ex.: 1 xícara, 150g..." />
          <Select name="refeicao" label="Refeição" defaultValue="cafe_da_manha">
            {REFEICOES.map((r) => (
              <option key={r} value={r}>
                {refeicaoLabel[r]}
              </option>
            ))}
          </Select>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={pending}>
              Registrar
            </Button>
            <button type="button" onClick={() => setSelecionado(null)} className="text-sm font-sans text-mid hover:text-ink hover:underline">
              Trocar alimento
            </button>
          </div>
        </div>
      )}

      {erroEnvio && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {erroEnvio}
        </p>
      )}
    </form>
  );
}
