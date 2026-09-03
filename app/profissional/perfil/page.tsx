import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { getPerfilCompleto } from "@/lib/auth/perfil";
import { labelEspecialidade } from "@/lib/labels";

export const metadata: Metadata = { title: "Perfil — Run Again" };

export default async function PerfilProfissionalPage() {
  const perfil = await getPerfilCompleto();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">PERFIL</h1>

      <Card variant="pillar" className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
            Nome
          </p>
          <p className="font-sans text-ink">{perfil?.nome}</p>
        </div>
        <div>
          <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
            E-mail
          </p>
          <p className="font-sans text-ink">{perfil?.email}</p>
        </div>
        <div>
          <p className="text-xs font-sans font-semibold uppercase tracking-wide text-mid">
            Especialidade
          </p>
          <p className="font-sans text-ink">
            {perfil?.especialidade ? labelEspecialidade[perfil.especialidade] : "—"}
          </p>
        </div>
      </Card>
    </div>
  );
}
