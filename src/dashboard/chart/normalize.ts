import type { MachineIntervalsResponse, ProduceBucket, ProduceCount, RuntimeSegment } from "@/api/types";
import type { Band, BandKind, Marker } from "./types";

function runtimeKind(type: RuntimeSegment["type"]): BandKind {
  return type === "unknown unplanned production" ? "unplanned-production" : "runtime";
}

function toBand(segment: { start_at: string; end_at: string }, kind: BandKind): Band {
  return { startMs: Date.parse(segment.start_at), endMs: Date.parse(segment.end_at), kind };
}

export function buildBands(data: Pick<MachineIntervalsResponse, "runtimes" | "downtimes" | "stoppages">): Band[] {
  const bands = [
    ...data.runtimes.map((segment) => toBand(segment, runtimeKind(segment.type))),
    ...data.downtimes.map((segment) => toBand(segment, "downtime")),
    ...data.stoppages.map((segment) => toBand(segment, "stoppage")),
  ];
  return bands.sort((a, b) => a.startMs - b.startMs);
}

const HOUR_MS = 60 * 60 * 1000;

/** One marker per hour bucket per result, sized by count — used when "Show individual produces" is off. */
export function buildCoarseMarkers(produceCounts: ProduceCount[]): Marker[] {
  const totalsByHour = new Map<number, { ok: number; ng: number }>();
  for (const row of produceCounts) {
    const hourMs = Date.parse(row.bucket_start);
    const totals = totalsByHour.get(hourMs) ?? { ok: 0, ng: 0 };
    totals.ok += row.ok_count;
    totals.ng += row.ng_count;
    totalsByHour.set(hourMs, totals);
  }

  const markers: Marker[] = [];
  for (const [hourMs, { ok, ng }] of totalsByHour) {
    const midpointMs = hourMs + HOUR_MS / 2;
    if (ok > 0) markers.push({ timeMs: midpointMs, result: "PASS", count: ok });
    if (ng > 0) markers.push({ timeMs: midpointMs, result: "FAIL", count: ng });
  }
  return markers.sort((a, b) => a.timeMs - b.timeMs);
}

/** One marker per part — used when "Show individual produces" is on. first_seen_ts is not sorted, so we sort once here. */
export function buildExactMarkers(produceBuckets: ProduceBucket[]): Marker[] {
  const markers: Marker[] = [];
  for (const bucket of produceBuckets) {
    for (const produce of bucket.produces) {
      markers.push({ timeMs: Date.parse(produce.first_seen_ts), result: produce.result, count: 1 });
    }
  }
  return markers.sort((a, b) => a.timeMs - b.timeMs);
}
