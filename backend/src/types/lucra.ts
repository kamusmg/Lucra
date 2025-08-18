
export type PositionSize = "Máximo" | "Médio" | "Mínimo" | "Não Operar";

export type RegimeTag = "normal" | "expansivo" | "defensivo";

export type Strictness = "full" | "relaxed";

export type ModeTag = "sonne" | "original" | "hybrid";

export type Bucket = "explore" | "exploit";

export type SignalType = "COMPRA" | "VENDA" | "NEUTRO";

export interface LucraSignal {
  symbol: string;
  signalType: SignalType;
  probability: string;
  finalConfidenceScore: number;
  recommendedPositionSize: PositionSize;
  mode: ModeTag;
  regimeTag: RegimeTag;
  strictnessLevel: Strictness;
  bucket: Bucket;
  entryDatetime: string;
  exitDatetime: string;
  entryWindow: string;
  exitWindow: string;
  passedValidations: string[];
  postEntryMonitoringLog?: string[];
}