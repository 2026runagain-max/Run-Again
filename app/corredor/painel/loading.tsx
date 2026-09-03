import { LoadingState } from "@/components/estados/LoadingState";
import { estadosPainel } from "@/lib/painel/copy";

export default function CarregandoPainel() {
  return <LoadingState subtitulo={estadosPainel.loading} />;
}
