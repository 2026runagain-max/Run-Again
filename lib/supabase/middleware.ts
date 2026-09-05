import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Papel } from "@/lib/types";
import { ROTAS_CORREDOR_SEM_PERSONA } from "@/lib/nav-config";

const AUTH_PAGES = ["/login", "/cadastro"];

// RF07-CA1 — enquanto persona é nula, /corredor/painel e qualquer rota de
// pilar redirecionam pro início da avaliação. Estas duas rotas são a
// exceção: é pra elas que o redirecionamento aponta, e a conta ainda
// precisa funcionar (perfil/logout) mesmo sem persona definida.
// (Lista compartilhada com o Header — ver lib/nav-config.ts.)

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const papel = (user?.app_metadata?.papel as Papel | undefined) ?? null;
  const { pathname } = request.nextUrl;

  const emAreaCorredor = pathname.startsWith("/corredor");
  const emAreaProfissional = pathname.startsWith("/profissional");
  const emPaginaDeAuth = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if ((emAreaCorredor || emAreaProfissional) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (emAreaCorredor && papel !== "corredor") {
    const url = request.nextUrl.clone();
    url.pathname = papel === "profissional" ? "/profissional/painel" : "/login";
    return NextResponse.redirect(url);
  }

  // RF07-CA1/CA3 — persona IS NULL bloqueia painel e qualquer pilar até o
  // corredor passar pelo Passo 0 da avaliação (RF02). Persona não vive no
  // JWT (não é decisão de segurança tamper-proof como app_metadata.papel —
  // ver nota em claude/arquitetura-tecnica-global.md §5, "Definir persona"),
  // por isso a checagem exige uma consulta extra, restrita às rotas que
  // realmente precisam dela.
  if (emAreaCorredor && user && papel === "corredor" && !ROTAS_CORREDOR_SEM_PERSONA.some((r) => pathname.startsWith(r))) {
    const { data: perfil } = await supabase.from("usuarios").select("persona").eq("id", user.id).single();
    if (!perfil?.persona) {
      // QA do beta: antes desta linha, o redirecionamento era mudo — quem
      // clicava em Nutrição/Psicologia/Comunidade/Treinos Recomendados antes
      // de terminar a avaliação caía de volta na mesma tela sem nenhuma
      // explicação (achado como "ponto sem saída" na varredura de QA). O
      // Header agora esconde esses links nesse estado (lib/nav-config.ts),
      // mas isto cobre quem chega direto pela URL (aba salva, histórico,
      // botão voltar) — pra esses casos, /corredor/comecar lê `bloqueado` e
      // mostra por que a rota pedida não abriu ainda.
      const url = request.nextUrl.clone();
      url.pathname = "/corredor/comecar";
      url.search = "";
      url.searchParams.set("bloqueado", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (emAreaProfissional && papel !== "profissional") {
    const url = request.nextUrl.clone();
    url.pathname = papel === "corredor" ? "/corredor/painel" : "/login";
    return NextResponse.redirect(url);
  }

  if (emPaginaDeAuth && user && papel) {
    const url = request.nextUrl.clone();
    url.pathname = `/${papel}/painel`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
