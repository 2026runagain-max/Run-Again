/**
 * Espelha design-system.md. Fonte de verdade é o markdown; este arquivo existe
 * para uso programático (ex.: passar cor para um componente de terceiro).
 * Componentes React devem preferir as classes Tailwind (bg-fire, text-ink, etc.)
 * geradas a partir de app/globals.css — só importe isto quando precisar do valor bruto.
 */
export const tokens = {
  color: {
    fire: "#E8470A",
    fireDim: "#E8470A18",
    fireText: "#C43C08",
    ink: "#0A0A0A",
    ink2: "#1A1A1A",
    ink3: "#242424",
    mid: "#6B6B6B",
    silver: "#C8C8C8",
    smoke: "#F0EFED",
    paper: "#FAFAF8",
    white: "#FFFFFF",
  },
  font: {
    display: "var(--font-bebas-neue)",
    sans: "var(--font-inter)",
  },
} as const;
