import { lowerBound } from "./search";
import { FAIL_LANE_Y, PASS_LANE_Y } from "./layout";
import type { Band, BandKind, Domain, Marker } from "./types";

export function timeToX(ms: number, domain: Domain, width: number): number {
  return ((ms - domain.fromMs) / (domain.toMs - domain.fromMs)) * width;
}

export function xToTime(x: number, domain: Domain, width: number): number {
  return domain.fromMs + (x / width) * (domain.toMs - domain.fromMs);
}

export interface BandRect {
  x: number;
  width: number;
  kind: BandKind;
}

export interface PaintGeometry {
  bandRects: BandRect[];
  markerX: Float32Array;
  markerY: Float32Array;
  markerIsFail: Uint8Array;
  visibleMarkerCount: number;
  drawnMarkerCount: number;
}

function clipBandsToDomain(bands: Band[], domain: Domain, width: number): BandRect[] {
  const rects: BandRect[] = [];
  for (const band of bands) {
    if (band.endMs <= domain.fromMs || band.startMs >= domain.toMs) continue;
    const left = Math.max(0, timeToX(band.startMs, domain, width));
    const right = Math.min(width, timeToX(band.endMs, domain, width));
    if (right <= left) continue;
    rects.push({ x: left, width: right - left, kind: band.kind });
  }
  return rects;
}

/**
 * Builds typed-array geometry for one paint. PASS markers are thinned to at most one per
 * horizontal pixel column once the visible count exceeds the pixel width; every FAIL marker
 * is always kept.
 */
export function buildPaintGeometry(bands: Band[], markers: Marker[], domain: Domain, width: number): PaintGeometry {
  const bandRects = clipBandsToDomain(bands, domain, width);

  const startIndex = lowerBound(markers, domain.fromMs);
  const endIndex = lowerBound(markers, domain.toMs);
  const visibleMarkerCount = endIndex - startIndex;

  const columnDrawn = visibleMarkerCount > width ? new Uint8Array(Math.ceil(width) + 1) : null;

  const xs: number[] = [];
  const ys: number[] = [];
  const isFail: number[] = [];

  for (let i = startIndex; i < endIndex; i++) {
    const marker = markers[i];
    const x = timeToX(marker.timeMs, domain, width);

    if (marker.result === "FAIL") {
      xs.push(x);
      ys.push(FAIL_LANE_Y);
      isFail.push(1);
      continue;
    }

    if (columnDrawn) {
      const column = Math.floor(x);
      if (columnDrawn[column]) continue;
      columnDrawn[column] = 1;
    }
    xs.push(x);
    ys.push(PASS_LANE_Y);
    isFail.push(0);
  }

  return {
    bandRects,
    markerX: Float32Array.from(xs),
    markerY: Float32Array.from(ys),
    markerIsFail: Uint8Array.from(isFail),
    visibleMarkerCount,
    drawnMarkerCount: xs.length,
  };
}

export interface AxisTick {
  x: number;
  ms: number;
}

export function computeAxisTicks(domain: Domain, width: number): AxisTick[] {
  const tickCount = Math.max(2, Math.floor(width / 110));
  const stepMs = (domain.toMs - domain.fromMs) / tickCount;

  const ticks: AxisTick[] = [];
  for (let i = 0; i <= tickCount; i++) {
    const ms = domain.fromMs + i * stepMs;
    ticks.push({ x: timeToX(ms, domain, width), ms });
  }
  return ticks;
}
