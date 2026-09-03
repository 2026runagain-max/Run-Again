export interface NavItem {
  label: string;
  href: string;
}

export const navCorredor: NavItem[] = [
  { label: "Início", href: "/corredor/painel" },
  { label: "Minha Recuperação", href: "/corredor/minha-recuperacao" },
  { label: "Perfil", href: "/corredor/perfil" },
];

export const navProfissional: NavItem[] = [
  { label: "Início", href: "/profissional/painel" },
  { label: "Pacientes", href: "/profissional/pacientes" },
  { label: "Perfil", href: "/profissional/perfil" },
];

export function navPorArea(area: "corredor" | "profissional"): NavItem[] {
  return area === "corredor" ? navCorredor : navProfissional;
}
