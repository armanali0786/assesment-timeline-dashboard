import type { ProduceResult } from "@/api/types";

export type BandKind = "runtime" | "unplanned-production" | "planned-downtime" | "downtime" | "stoppage";

export interface Band {
  startMs: number;
  endMs: number;
  kind: BandKind;
}

export interface Marker {
  timeMs: number;
  result: ProduceResult;
  count: number;
}

export interface Domain {
  fromMs: number;
  toMs: number;
}
