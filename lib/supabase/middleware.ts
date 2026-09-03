import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Papel } from "@/lib/types";

const AUTH_PAGES = ["/login", "/cadastro"];

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
