import { LoadingState } from "@/components/estados/LoadingState";
import { corredorCopy } from "@/lib/psicologia/copy";

export default function CarregandoPsicologia() {
  return <LoadingState subtitulo={corredorCopy.loading} />;
}
