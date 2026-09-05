import "server-only";

/**
 * Auditoria de segurança pré-lançamento (2026-09) — limite de tentativas por
 * IP pra rota pública sem login (item 4 da tarefa): formulário da lista de
 * fundadores (lib/leads/actions.ts) e cadastro de corredor com código de
 * convite de beta (app/api/cadastro-corredor/route.ts), cada um com seu
 * próprio limite (ver `chave` com namespace — "lead:", "cadastro:" — pra
 * nunca compartilhar contador entre os dois).
 *
 * Em memória, de propósito — é a correção mais simples que resolve o
 * problema real desta fase (um script simples tentando várias vezes em
 * sequência), sem exigir infraestrutura nova (Redis, serviço externo de
 * rate limit). Limitação honesta: numa função serverless da Vercel, uma
 * instância "fria" nova começa zerada, então isto não é um limite
 * perfeitamente distribuído entre todas as instâncias ao mesmo tempo — mas
 * instâncias ficam "quentes" por um tempo entre requisições, e combinado
 * com as outras camadas de cada rota (honeypot, RPC de convite atômico e
 * travado a service role, e-mail único no banco), cobre a ameaça real de
 * agora. Se o tráfego do beta mostrar que não é suficiente, o próximo
 * passo é mover pra uma tabela no Postgres (já compartilhada entre
 * instâncias) — não precisa disso ainda.
 */
interface Balde {
  contagem: number;
  expiraEm: number;
}

const baldesPorChave = new Map<string, Balde>();

/** true = pode seguir; false = estourou o limite desta janela. */
export function checarRateLimit(chave: string, opcoes: { limite: number; janelaMs: number }): boolean {
  const agora = Date.now();
  const atual = baldesPorChave.get(chave);

  if (!atual || atual.expiraEm < agora) {
    baldesPorChave.set(chave, { contagem: 1, expiraEm: agora + opcoes.janelaMs });
    return true;
  }

  if (atual.contagem >= opcoes.limite) {
    return false;
  }

  atual.contagem += 1;
  return true;
}

/** IP do visitante a partir dos headers padrão que a Vercel repassa pra
 * função serverless (a conexão TCP em si chega da rede interna da própria
 * Vercel, não do visitante) — mesmo helper pras duas rotas que precisam. */
export function ipDaRequisicao(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconhecido";
}
