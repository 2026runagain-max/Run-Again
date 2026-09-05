import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { materiais, labelTipoMaterial } from "@/lib/site/materiais";

export const metadata: Metadata = {
  title: "Run Again Materiais — Run Again",
  description:
    "Ebooks e cursos do Run Again, vendidos via Hotmart — conteúdo pra quem quer avançar sem esperar o app abrir.",
};

export default function MateriaisPage() {
  return (
    <main>
      <section className="bg-ink px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow dark>Run Again Materiais</Eyebrow>
          <h1 className="mt-2 font-display text-4xl leading-tight text-white sm:text-5xl">
            Conteúdo pago, direto do time que assina o protocolo.
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-sans text-base leading-relaxed text-silver">
            Ebooks e cursos vendidos pelo Hotmart — o Run Again não processa
            pagamento nenhum, só te leva até lá. Cada produto tem sua própria
            página, com o que ele cobre e o link de compra.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materiais.map((material) => (
            <Card
              key={material.slug}
              variant="pillar"
              className="flex h-full flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <Badge>{labelTipoMaterial[material.tipo].toUpperCase()}</Badge>
                {material.placeholder && <Badge>EXEMPLO</Badge>}
              </div>
              <h2 className="font-display text-2xl text-ink">{material.nome}</h2>
              <p className="flex-1 text-sm font-sans text-mid">{material.descricaoCurta}</p>
              <Button href={material.href} variant="fire-ghost" className="self-start">
                Ver produto
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
