import type { BandaRisco } from "@/lib/avaliacao/types";
import type { CargaVida, HistoricoAtendimentoResumo, ZonaResposta } from "@/lib/fisioterapia/types";

// Resultado padrão de toda leitura do painel — distingue "deu erro de
// verdade" de "ainda não há dado" (vazio), porque o §8 do PRD exige textos
// diferentes pras duas situações. `data` some quando ok é false: o card
// correspondente renderiza o estado de erro em vez de tentar ler um dado
// que não existe.
export type ResultadoPainel<T> = { ok: true; data: T } | { ok: false };

export type BandaCargaForma = "tranquila" | "atencao" | "sobrecarga";

export interface HeroStatusDia {
  zona: ZonaResposta;
  respondidoEm: string;
}

export interface AderenciaResumo {
  concluidos: number;
  prescritos: number;
  percentual: number;
}

export interface CargaFormaResumo {
  banda: BandaCargaForma;
  cargaVida: CargaVida | null;
  cargaVidaOrigem: "resposta24h" | "diagnostico" | null;
  rpeMedio: number | null;
  zonaPredominante: ZonaResposta | null;
}

export interface RiscoResumo {
  bandaInicial: BandaRisco;
  bandaAtual: BandaRisco;
  scoreAtual: number;
  temDadoNovo: boolean;
}

export interface BemEstarResumo {
  frase: string;
}

export type { HistoricoAtendimentoResumo };

export interface PilarConfig {
  nome: string;
  ativo: boolean;
}
