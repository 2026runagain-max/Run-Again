"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Resultado = { ok: true } | { ok: false; erro: string };

const ERRO_GENERICO = "Não conseguimos salvar isso agora. Não é nada que você fez — tenta de novo em instantes.";

// RF10 — flag própria do painel, nunca reaproveita
// corredor_viu_onboarding_prescricao (RF10.1).
export async function marcarOnboardingPainelVistoAction(): Promise<Resultado> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.app_metadata?.papel !== "corredor") {
      throw new Error("Não autorizado.");
    }

    const { error } = await supabase
      .from("usuarios")
      .update({ corredor_viu_onboarding_painel: true })
      .eq("id", user.id);

    if (error) return { ok: false, erro: ERRO_GENERICO };
    revalidatePath("/corredor/painel");
    return { ok: true };
  } catch {
    return { ok: false, erro: ERRO_GENERICO };
  }
}
