import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Único ponto do repositório que usa a service role key (bypassa RLS).
 * Nunca importar isto de um Client Component ou de código que possa
 * ser incluído no bundle do browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
