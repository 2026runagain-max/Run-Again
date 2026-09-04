export interface NavItem {
  label: string;
  href: string;
}

export const navCorredor: NavItem[] = [
  { label: "Início", href: "/corredor/painel" },
  { label: "Minha Recuperação", href: "/corredor/minha-recuperacao" },
  { label: "Nutrição", href: "/corredor/nutricao" },
  { label: "Psicologia", href: "/corredor/psicologia/check-in" },
  { label: "Comunidade", href: "/corredor/comunidade" },
  { label: "Perfil", href: "/corredor/perfil" },
];

export const navProfissional: NavItem[] = [
  { label: "Início", href: "/profissional/painel" },
  { label: "Pacientes", href: "/profissional/pacientes" },
  { label: "Nutrição", href: "/profissional/nutricao/casos" },
  { label: "Psicologia", href: "/profissional/psicologia/fila" },
  { label: "Perfil", href: "/profissional/perfil" },
];

// §4 do PRD "Site Aberto" — navegação do header público (deslogado), à
// esquerda dos CTAs de conversão.
export const navPublico: NavItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "Explica", href: "/explica" },
  { label: "Método", href: "/metodo" },
  { label: "Sobre", href: "/sobre" },
];

export function navPorArea(area: "publico" | "corredor" | "profissional"): NavItem[] {
  if (area === "corredor") return navCorredor;
  if (area === "profissional") return navProfissional;
  return navPublico;
}
