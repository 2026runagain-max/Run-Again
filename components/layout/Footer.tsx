import Link from "next/link";

// "Rodapé" da copy de home (copy/home-lista-fundadoras.md): Área de Membro,
// Ebook Corrida sem Lesão e Contato — mantidos junto dos links institucionais
// que já existiam desde o Fluxo 1.
const linksInstitucionais = [
  { label: "Área de Membro", href: "/area-de-membro" },
  { label: "Ebook Corrida sem Lesão", href: "/ebook-corrida-sem-lesao" },
  // Item 16 (feedback da Marina): Blog e Run Explica precisam ficar
  // acessíveis pra quem já está logado, sem precisar deslogar — este
  // Footer é o mesmo componente usado nas áreas de corredor e
  // profissional (app/corredor/layout.tsx, app/profissional/layout.tsx),
  // então incluir os dois aqui resolve sem tocar na navegação do header.
  { label: "Blog", href: "/blog" },
  { label: "Run Explica", href: "/explica" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Termos de Uso", href: "/termos" },
  { label: "Política de Privacidade", href: "/privacidade" },
];

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
