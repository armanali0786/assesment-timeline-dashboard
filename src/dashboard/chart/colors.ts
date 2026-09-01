import type { ProduceResult } from "@/api/types";
import type { BandKind } from "./types";

export const BAND_COLORS: Record<BandKind, string> = {
  runtime: "#26a69a",
  "unplanned-production": "#c0ca33",
  downtime: "#ff8a65",
  stoppage: "#7e57c2",
};

export const BAND_LABELS: Record<BandKind, string> = {
  runtime: "Runtime",
  "unplanned-production": "Unplanned Production",
  downtime: "Unknown Downtime",
  stoppage: "Minor Stoppage",
};

export const MARKER_COLORS: Record<ProduceResult, string> = {
  PASS: "#2e7d32",
  FAIL: "#d32f2f",
};
