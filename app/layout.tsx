import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site/config";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Convenção do repo: cada página exporta o título completo já com o sufixo
  // "— Run Again" (ver app/(publico)/sobre/page.tsx etc.) — sem template
  // aqui pra não duplicar esse sufixo.
  title: "Run Again — Beta",
  description:
    "Protocolo de retorno ao esporte para corredores lesionados. Treino, preparo físico e ecossistema clínico em um só lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
