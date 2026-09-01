import type { CycleTimeBucket, MachineIntervalsResponse, TimeRange } from "@/api/types";
import { HOUR_MS } from "@/utils/time";

export interface HourBucket {
  startMs: number;
  endMs: number;
}

export interface HourRow {
  bucket: HourBucket;
  total: number;
  pass: number;
  fail: number;
  runtimeMinutes: number;
  unplannedProductionMinutes: number;
  stoppageMinutes: number;
  plannedDowntimeMinutes: number;
  unknownDowntimeMinutes: number;
  idealCycleTimeSeconds: number | null;
  actualCycleTimeSeconds: number | null;
  isFuture: boolean;
}

/** One bucket per hour of the shift, starting at from_ts; the last bucket is clipped to to_ts. */
export function buildHourBuckets({ from_ts, to_ts }: TimeRange): HourBucket[] {
  const fromMs = Date.parse(from_ts);
  const toMs = Date.parse(to_ts);

  const buckets: HourBucket[] = [];
  for (let start = fromMs; start < toMs; start += HOUR_MS) {
    buckets.push({ startMs: start, endMs: Math.min(start + HOUR_MS, toMs) });
  }
  return buckets;
}

function overlapMinutes(segmentStartMs: number, segmentEndMs: number, bucket: HourBucket): number {
  const overlapStart = Math.max(segmentStartMs, bucket.startMs);
  const overlapEnd = Math.min(segmentEndMs, bucket.endMs);
  return overlapEnd > overlapStart ? (overlapEnd - overlapStart) / 60_000 : 0;
}

function addMinutesToBuckets(
  rows: HourRow[],
  buckets: HourBucket[],
  segmentStartMs: number,
  segmentEndMs: number,
  addTo: (row: HourRow, minutes: number) => void,
) {
  for (let i = 0; i < buckets.length; i++) {
    const minutes = overlapMinutes(segmentStartMs, segmentEndMs, buckets[i]);
    if (minutes > 0) addTo(rows[i], minutes);
  }
}

export function buildHourlySummary(
  intervals: MachineIntervalsResponse,
  cycleTimeBuckets: CycleTimeBucket[],
  timeRange: TimeRange,
  nowMs: number = Date.now(),
): HourRow[] {
  const buckets = buildHourBuckets(timeRange);
  const rows: HourRow[] = buckets.map((bucket) => ({
    bucket,
    total: 0,
    pass: 0,
    fail: 0,
    runtimeMinutes: 0,
    unplannedProductionMinutes: 0,
    stoppageMinutes: 0,
    plannedDowntimeMinutes: 0,
    unknownDowntimeMinutes: 0,
    idealCycleTimeSeconds: null,
    actualCycleTimeSeconds: null,
    isFuture: bucket.startMs >= nowMs,
  }));

  for (const runtime of intervals.runtimes) {
    const startMs = Date.parse(runtime.start_at);
    const endMs = Date.parse(runtime.end_at);
    const addTo =
      runtime.type === "unknown unplanned production"
        ? (row: HourRow, minutes: number) => (row.unplannedProductionMinutes += minutes)
        : (row: HourRow, minutes: number) => (row.runtimeMinutes += minutes);
    addMinutesToBuckets(rows, buckets, startMs, endMs, addTo);
  }

  for (const downtime of intervals.downtimes) {
    const startMs = Date.parse(downtime.start_at);
    const endMs = Date.parse(downtime.end_at);
    const addTo =
      downtime.type === "unknown"
        ? (row: HourRow, minutes: number) => (row.unknownDowntimeMinutes += minutes)
        : (row: HourRow, minutes: number) => (row.plannedDowntimeMinutes += minutes);
    addMinutesToBuckets(rows, buckets, startMs, endMs, addTo);
  }

  for (const stoppage of intervals.stoppages) {
    addMinutesToBuckets(rows, buckets, Date.parse(stoppage.start_at), Date.parse(stoppage.end_at), (row, minutes) => {
      row.stoppageMinutes += minutes;
    });
  }

  const bucketIndexByStartMs = new Map(buckets.map((bucket, index) => [bucket.startMs, index]));

  for (const produceCount of intervals.produce_counts) {
    const index = bucketIndexByStartMs.get(Date.parse(produceCount.bucket_start));
    if (index === undefined) continue;
    rows[index].pass += produceCount.ok_count;
    rows[index].fail += produceCount.ng_count;
    rows[index].total += produceCount.ok_count + produceCount.ng_count;
  }

  for (const cycleTimeBucket of cycleTimeBuckets) {
    const index = bucketIndexByStartMs.get(Date.parse(cycleTimeBucket.bucket_start));
    if (index === undefined) continue;
    rows[index].idealCycleTimeSeconds = cycleTimeBucket.ideal_cycle_time_seconds;
    rows[index].actualCycleTimeSeconds = cycleTimeBucket.actual_cycle_time_seconds;
  }

  return rows;
}
