import Link from "next/link";

// "Rodapé" da copy de home (copy/home-lista-fundadoras.md): Área de Membro,
// Ebook Corrida sem Lesão e Contato — mantidos junto dos links institucionais
// que já existiam desde o Fluxo 1.
//
// Reestruturação de navegação (decisão de produto, 2026-09): rodapé
// definitivo, usado nas duas versões (deslogada e logada, já que este
// mesmo componente é importado por app/(publico)/layout.tsx,
// app/corredor/layout.tsx e app/profissional/layout.tsx — ver nota do item
// 16 abaixo). "Blog" aponta pra "/" agora (o blog é a própria home), e
// ganhou "Método" e "Run Again Materiais", que faltavam aqui.
const linksInstitucionais = [
  { label: "Área de Membro", href: "/area-de-membro" },
  { label: "Ebook Corrida sem Lesão", href: "/ebook-corrida-sem-lesao" },
  // Item 16 (feedback da Marina): Blog e Run Explica precisam ficar
  // acessíveis pra quem já está logado, sem precisar deslogar — este
  // Footer é o mesmo componente usado nas áreas de corredor e
  // profissional (app/corredor/layout.tsx, app/profissional/layout.tsx),
  // então incluir os dois aqui resolve sem tocar na navegação do header.
  { label: "Blog", href: "/" },
  { label: "Run Explica", href: "/explica" },
  { label: "Método", href: "/metodo" },
  { label: "Run Again Materiais", href: "/materiais" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Termos de Uso", href: "/termos" },
  { label: "Política de Privacidade", href: "/privacidade" },
];

// ATENÇÃO — placeholder deliberado (reestruturação de navegação, item 4 da
// tarefa: rodapé definitivo pede "redes sociais"). Nenhuma conta social do
// Run Again existe/foi informada ainda — os hrefs abaixo são "#" de
// propósito, pra não inventar um endereço que não existe. Trocar por link
// real (e adicionar/remover redes conforme o que a marca de fato abrir)
// antes do lançamento.
const redesSociais = [{ label: "Instagram", href: "#" }];

export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-silver">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-lg text-white">RUN AGAIN</span>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {linksInstitucionais.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-sans text-silver transition-colors hover:text-fire"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {redesSociais.map((rede) => (
            <a
              key={rede.label}
              href={rede.href}
              className="text-sm font-sans text-silver transition-colors hover:text-fire"
            >
              {rede.label}
            </a>
          ))}
        </nav>

        <p className="text-xs font-sans text-silver/70">
          Você está usando a versão beta do Run Again.
        </p>
        <p className="text-xs font-sans text-silver/70">
          © {ano} Run Again. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
