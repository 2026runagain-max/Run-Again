/**
 * "Run Again Materiais" — vitrine de infoprodutos (ebooks, cursos) vendidos
 * via Hotmart. O Run Again não processa pagamento nenhum: cada botão de
 * compra só redireciona pro link de checkout do Hotmart daquele produto
 * específico (nenhuma integração de API/webhook nesta fase — decisão de
 * produto, ver TAREFA).
 *
 * Só o ebook "Corrida sem Lesão" é real hoje (página própria já existe em
 * /ebook-corrida-sem-lesao, com copy real). Os outros 3 são
 * PLACEHOLDERS deliberados — existem pra fixar a estrutura completa
 * (header, vitrine, página de venda) antes do conteúdo real existir, pra
 * trocar por produto de verdade depois sem mexer em estrutura de novo.
 * Cada placeholder tem sua própria página em /materiais/[produto]
 * (app/(publico)/materiais/[produto]/page.tsx), com aviso visível na tela
 * e comentário no código apontando o link do Hotmart pra trocar.
 */

export type TipoMaterial = "ebook" | "curso";

export interface Material {
  slug: string;
  nome: string;
  tipo: TipoMaterial;
  descricaoCurta: string;
  /** Página de venda deste produto — do próprio site, nunca o link do Hotmart direto (esse fica só dentro da página de venda, no botão "Comprar"). */
  href: string;
  /** true só pros 3 produtos-exemplo (item 3 da tarefa) — false pro ebook real. */
  placeholder: boolean;
}

export const materiais: Material[] = [
  {
    slug: "ebook-corrida-sem-lesao",
    nome: "Ebook Corrida sem Lesão",
    tipo: "ebook",
    descricaoCurta: "Como voltar a correr em progressão real, sem repetir o erro que te machucou da primeira vez.",
    href: "/ebook-corrida-sem-lesao",
    placeholder: false,
  },
  {
    slug: "ebook-2",
    nome: "Ebook 2",
    tipo: "ebook",
    descricaoCurta: "Descrição do produto — a preencher quando o conteúdo for definido.",
    href: "/materiais/ebook-2",
    placeholder: true,
  },
  {
    slug: "curso-1",
    nome: "Curso 1",
    tipo: "curso",
    descricaoCurta: "Descrição do produto — a preencher quando o conteúdo for definido.",
    href: "/materiais/curso-1",
    placeholder: true,
  },
  {
    slug: "curso-2",
    nome: "Curso 2",
    tipo: "curso",
    descricaoCurta: "Descrição do produto — a preencher quando o conteúdo for definido.",
    href: "/materiais/curso-2",
    placeholder: true,
  },
];

export const labelTipoMaterial: Record<TipoMaterial, string> = {
  ebook: "Ebook",
  curso: "Curso",
};

// ATENÇÃO — placeholder deliberado (item 3 da tarefa "Loja de infoprodutos"):
// nenhum destes 3 produtos tem link real do Hotmart ainda. Trocar esta
// constante por um link real (ou, quando os produtos tiverem links
// diferentes entre si, mover pra um campo `hotmartUrl` por produto neste
// mesmo array) antes de lançar CADA UM dos 3 placeholders.
export const HOTMART_URL_PLACEHOLDER = "https://pay.hotmart.com/EXEMPLO-SUBSTITUIR";

export function getMaterialPlaceholder(slug: string): Material | undefined {
  return materiais.find((m) => m.placeholder && m.slug === slug);
}
