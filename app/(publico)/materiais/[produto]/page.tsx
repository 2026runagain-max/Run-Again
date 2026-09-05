import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  materiais,
  getMaterialPlaceholder,
  labelTipoMaterial,
  HOTMART_URL_PLACEHOLDER,
} from "@/lib/site/materiais";

// Só os 3 produtos-exemplo (item 3 da tarefa) — o ebook real tem página
// própria em /ebook-corrida-sem-lesao, fora desta rota dinâmica.
export function generateStaticParams() {
  return materiais.filter((m) => m.placeholder).map((m) => ({ produto: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ produto: string }>;
}): Promise<Metadata> {
  const { produto: slug } = await params;
  const material = getMaterialPlaceholder(slug);
  if (!material) return { title: "Produto não encontrado — Run Again" };

  return { title: `${material.nome} — Run Again Materiais` };
}

export default async function ProdutoPlaceholderPage({
  params,
}: {
  params: Promise<{ produto: string }>;
}) {
  const { produto: slug } = await params;
  const material = getMaterialPlaceholder(slug);
  if (!material) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-sans text-sm text-mid">
        <Link href="/materiais" className="hover:underline">
          Run Again Materiais
        </Link>
      </p>

      {/* Aviso visível de propósito (item 3 da tarefa: "conteúdo genérico
          claramente marcado como exemplo") — não é só comentário de
          código, precisa aparecer pra quem abrir a página também. */}
      <Badge className="mt-4">EXEMPLO · CONTEÚDO A DEFINIR</Badge>

      <Eyebrow className="mt-4">{labelTipoMaterial[material.tipo]}</Eyebrow>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink">{material.nome}</h1>

      <p className="mt-5 font-sans text-base leading-relaxed text-mid">
        Descrição do produto — a preencher quando o conteúdo for definido.
      </p>

      <Card variant="insight" className="mt-8">
        <p className="font-sans text-sm leading-relaxed text-ink">
          Esta é uma página-modelo: o produto ainda não existe de verdade. Ela
          fica no ar só pra fixar a estrutura (header, vitrine, página de
          venda) antes do conteúdo real — nome, descrição e link de compra
          reais substituem isto aqui quando o produto for definido.
        </p>
      </Card>

      <div className="mt-8">
        {/* ATENÇÃO — link placeholder (item 3 da tarefa "Loja de
            infoprodutos"): "EXEMPLO-SUBSTITUIR" não é um produto real no
            Hotmart. Trocar HOTMART_URL_PLACEHOLDER (lib/site/materiais.ts)
            pelo link real de checkout deste produto específico antes de
            lançá-lo — nunca lançar com este link no ar. */}
        <Button href={HOTMART_URL_PLACEHOLDER} variant="primary">
          Comprar
        </Button>
      </div>
    </main>
  );
}
