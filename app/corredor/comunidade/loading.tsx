import { LoadingState } from "@/components/estados/LoadingState";
import { comunidadeCopy } from "@/lib/comunidade/copy";

export default function CarregandoComunidade() {
  return <LoadingState subtitulo={comunidadeCopy.loading} />;
}
