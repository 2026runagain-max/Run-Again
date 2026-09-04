// Provisionamento de conta profissional (RF04) — processo manual do beta.
// Não existe tela pública de cadastro para papel = profissional; quem convida
// é sempre o admin do Run Again, rodando este script.
//
// Uso:
//   node --env-file=.env.local scripts/criar-convite-profissional.mjs \
//     "email@exemplo.com" "Nome Completo" fisioterapia
//
// Especialidades válidas: fisioterapia | educacao_fisica | nutricao_esportiva
//                          | psicologia_esporte

import { createClient } from "@supabase/supabase-js";

const [, , email, nome, especialidade] = process.argv;
const ESPECIALIDADES = [
  "fisioterapia",
  "educacao_fisica",
  "nutricao_esportiva",
  "psicologia_esporte",
];

if (!email || !nome || !especialidade) {
  console.error(
    'Uso: node --env-file=.env.local scripts/criar-convite-profissional.mjs "email@exemplo.com" "Nome Completo" especialidade',
  );
  console.error(`Especialidades válidas: ${ESPECIALIDADES.join(", ")}`);
  process.exit(1);
}

if (!ESPECIALIDADES.includes(especialidade)) {
  console.error(`Especialidade inválida: ${especialidade}`);
  console.error(`Use uma de: ${ESPECIALIDADES.join(", ")}`);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltam variáveis de ambiente. Rode com --env-file=.env.local (Node 20.6+).",
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey);

const expiraEm = new Date();
expiraEm.setDate(expiraEm.getDate() + 7);

const { data, error } = await admin
  .from("convites_profissional")
  .insert({ email, nome, especialidade, expira_em: expiraEm.toISOString() })
  .select()
  .single();

if (error) {
  console.error("Erro ao criar convite:", error.message);
  process.exit(1);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
console.log("Convite criado com sucesso.");
console.log(`Expira em: ${expiraEm.toISOString()}`);
console.log("");
console.log("Link para enviar ao profissional (envio de e-mail é manual nesta fase):");
console.log(`${appUrl}/convite/${data.token}`);
