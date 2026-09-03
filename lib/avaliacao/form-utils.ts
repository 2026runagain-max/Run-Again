/**
 * Compartilhado entre o server action de autosave (lib/avaliacao/actions.ts)
 * e os componentes de bloco no client (para espelhar localmente o que acabou
 * de ser salvo, sem esperar um novo round-trip só pra reexibir o próprio
 * valor ao usar "Voltar" — ver AvaliacaoWizard.tsx). Sem "use server": um
 * módulo "use server" só pode exportar função assíncrona, e isto é usado
 * tanto no server quanto no client.
 */
export function formDataParaObjeto(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [chave, valor] of formData.entries()) {
    if (typeof valor !== "string") continue;
    if (valor === "") continue; // campo opcional em branco não vira string vazia no jsonb
    obj[chave] = valor;
  }
  return obj;
}
