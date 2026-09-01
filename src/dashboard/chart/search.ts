import type { Marker } from "./types";

/** First index whose timeMs is >= targetMs (markers must be sorted ascending). */
export function lowerBound(markers: Marker[], targetMs: number): number {
  let lo = 0;
  let hi = markers.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (markers[mid].timeMs < targetMs) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function findNearestMarkerIndex(markers: Marker[], targetMs: number): number | null {
  if (markers.length === 0) return null;
  const index = lowerBound(markers, targetMs);

  if (index === 0) return 0;
  if (index === markers.length) return index - 1;

  const before = markers[index - 1];
  const after = markers[index];
  return targetMs - before.timeMs <= after.timeMs - targetMs ? index - 1 : index;
}
