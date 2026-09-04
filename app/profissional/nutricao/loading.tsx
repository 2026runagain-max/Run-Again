import { LoadingState } from "@/components/estados/LoadingState";
import { estadosProfissional } from "@/lib/nutricao/copy";

export default function CarregandoNutricaoProfissional() {
  return <LoadingState subtitulo={estadosProfissional.loadingCaso} />;
}
