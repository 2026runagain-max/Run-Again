"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { navPorArea } from "@/lib/nav-config";
import { cn } from "@/lib/cn";
import type { Sessao } from "@/lib/types";
import { logoutAction } from "@/lib/auth/actions";

export interface HeaderProps {
  area: "publico" | "corredor" | "profissional";
  sessao: Sessao | null;
}

export function Header({ area, sessao }: HeaderProps) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const [avatarMenuAberto, setAvatarMenuAberto] = useState(false);

  const itens = area === "publico" ? [] : navPorArea(area);
  const logoHref = sessao ? `/${sessao.papel}/painel` : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-mid/10 bg-paper text-ink">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={logoHref} className="font-display text-xl tracking-wide">
            RUN AGAIN
          </Link>
          <Badge>BETA</Badge>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {itens.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold font-sans transition-colors hover:text-fire",
                  ativo ? "text-fire underline underline-offset-4" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {sessao ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAvatarMenuAberto((v) => !v)}
                className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire/40"
                aria-haspopup="menu"
                aria-expanded={avatarMenuAberto}
              >
                <Avatar nome={sessao.nome} />
              </button>
              {avatarMenuAberto && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 rounded-xl border border-mid/15 bg-white py-1 shadow-lg"
                >
                  <Link
                    href={`/${sessao.papel}/perfil`}
                    className="block px-4 py-2 text-sm font-sans text-ink hover:bg-smoke"
                    role="menuitem"
                    onClick={() => setAvatarMenuAberto(false)}
                  >
                    Perfil
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="block w-full px-4 py-2 text-left text-sm font-sans text-ink hover:bg-smoke"
                    >
                      Sair
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                href="/login"
                variant="ghost"
                className="border-ink text-ink hover:bg-ink/5"
              >
                Entrar
              </Button>
              <Button href="/cadastro" variant="primary">
                Começar
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M2 5.5H20M2 11H20M2 16.5H20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {menuAberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMenuAberto(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col gap-6 bg-paper p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg">RUN AGAIN</span>
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="flex h-9 w-9 items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M2 2L16 16M16 2L2 16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-4">
              {itens.map((item) => {
                const ativo = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className={cn(
                      "text-base font-semibold font-sans",
                      ativo ? "text-fire" : "text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {sessao && (
                <Link
                  href={`/${sessao.papel}/perfil`}
                  onClick={() => setMenuAberto(false)}
                  className="text-base font-semibold font-sans text-ink"
                >
                  Perfil
                </Link>
              )}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              {sessao ? (
                <form action={logoutAction}>
                  <Button type="submit" variant="fire-ghost" className="w-full">
                    Sair
                  </Button>
                </form>
              ) : (
                <>
                  <Button href="/cadastro" variant="primary" className="w-full">
                    Começar
                  </Button>
                  <Button
                    href="/login"
                    variant="ghost"
                    className="w-full border-ink text-ink hover:bg-ink/5"
                  >
                    Entrar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
