import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSessao } from "@/lib/auth/session";
import { contarCasosAbertos } from "@/lib/nutricao/queries";

export const metadata: Metadata = { title: "Painel — Run Again" };

export default async function PainelProfissionalPage() {
  const sessao = await getSessao();
  const casos = await contarCasosAbertos();
  const totalCasos = casos.seguranca + casos.revisao;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-fire-text">
          EQUIPE RUN AGAIN
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink">
          Oi, {sessao?.nome.split(" ")[0]}.
        </h1>
      </div>

      <Link href="/profissional/pacientes">
        <Card variant="pillar" className="flex flex-col gap-2 transition-shadow hover:shadow-md">
          <Badge>PRESCRIÇÃO CLÍNICA</Badge>
          <h2 className="font-display text-2xl text-ink">Pacientes</h2>
          <p className="text-sm font-sans text-mid">
            Busca um corredor, abre o prontuário e continua (ou inicia) o atendimento.
          </p>
        </Card>
      </Link>

      <Link href="/profissional/nutricao/casos">
        <Card variant="pillar" className="flex flex-col gap-2 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <Badge>NUTRIÇÃO ESPORTIVA</Badge>
            {totalCasos > 0 && <Badge>{totalCasos} CASO{totalCasos > 1 ? "S" : ""}</Badge>}
          </div>
          <h2 className="font-display text-2xl text-ink">Fila de casos</h2>
          <p className="text-sm font-sans text-mid">
            {totalCasos > 0
              ? `${casos.seguranca} de segurança, ${casos.revisao} de revisão — aguardando você.`
              : "Nenhum caso pedindo sua atenção agora."}
          </p>
        </Card>
      </Link>
    </div>
  );
}
