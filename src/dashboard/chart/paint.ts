import { BAND_COLORS, BAND_LABELS, MARKER_COLORS } from "./colors";
import { computeAxisTicks, timeToX } from "./geometry";
import { AXIS_Y, BAND_HEIGHT, BAND_TOP, MARKER_RADIUS } from "./layout";
import { formatIstTime } from "@/utils/time";
import type { PaintGeometry } from "./geometry";
import type { Domain } from "./types";

const MIN_LABELED_BAND_WIDTH = 14;

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, MARKER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function drawBands(ctx: CanvasRenderingContext2D, bandRects: PaintGeometry["bandRects"]) {
  for (const rect of bandRects) {
    ctx.fillStyle = BAND_COLORS[rect.kind];
    ctx.fillRect(rect.x, BAND_TOP, Math.max(rect.width, 0.5), BAND_HEIGHT);
  }

  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const rect of bandRects) {
    if (rect.width < MIN_LABELED_BAND_WIDTH) continue;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, BAND_TOP, rect.width, BAND_HEIGHT);
    ctx.clip();
    ctx.translate(rect.x + rect.width / 2, BAND_TOP + BAND_HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(BAND_LABELS[rect.kind].toUpperCase(), 0, 0);
    ctx.restore();
  }
}

function drawMarkers(ctx: CanvasRenderingContext2D, geometry: PaintGeometry) {
  const { markerX, markerY, markerIsFail } = geometry;

  ctx.fillStyle = MARKER_COLORS.PASS;
  for (let i = 0; i < markerX.length; i++) {
    if (markerIsFail[i]) continue;
    drawDot(ctx, markerX[i], markerY[i]);
  }

  ctx.fillStyle = MARKER_COLORS.FAIL;
  for (let i = 0; i < markerX.length; i++) {
    if (!markerIsFail[i]) continue;
    drawDot(ctx, markerX[i], markerY[i]);
  }
}

function drawAxis(ctx: CanvasRenderingContext2D, domain: Domain, width: number) {
  ctx.strokeStyle = "#e0e0e0";
  ctx.fillStyle = "#616161";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  for (const tick of computeAxisTicks(domain, width)) {
    ctx.beginPath();
    ctx.moveTo(tick.x, BAND_TOP);
    ctx.lineTo(tick.x, AXIS_Y - 14);
    ctx.stroke();
    ctx.fillText(formatIstTime(new Date(tick.ms).toISOString()), tick.x, AXIS_Y);
  }
}

function drawPill(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, text: string) {
  ctx.font = "bold 10px sans-serif";
  const paddingX = 7;
  const height = 16;
  const width = ctx.measureText(text).width + paddingX * 2;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  const radius = height / 2;

  ctx.fillStyle = "#1565c0";
  ctx.beginPath();
  ctx.moveTo(left + radius, top);
  ctx.arcTo(left + width, top, left + width, top + height, radius);
  ctx.arcTo(left + width, top + height, left, top + height, radius);
  ctx.arcTo(left, top + height, left, top, radius);
  ctx.arcTo(left, top, left + width, top, radius);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, centerX, top + height / 2 + 1);
}

function drawNowLine(ctx: CanvasRenderingContext2D, domain: Domain, width: number, nowMs: number) {
  if (nowMs < domain.fromMs || nowMs > domain.toMs) return;

  const nowX = timeToX(nowMs, domain, width);
  ctx.strokeStyle = "#1565c0";
  ctx.beginPath();
  ctx.moveTo(nowX, BAND_TOP);
  ctx.lineTo(nowX, BAND_TOP + BAND_HEIGHT);
  ctx.stroke();

  drawPill(ctx, nowX, BAND_TOP - 12, "NOW");
}

export function paintChart(
  ctx: CanvasRenderingContext2D,
  geometry: PaintGeometry,
  domain: Domain,
  width: number,
  height: number,
  nowMs: number,
) {
  ctx.clearRect(0, 0, width, height);
  drawBands(ctx, geometry.bandRects);
  drawMarkers(ctx, geometry);
  drawAxis(ctx, domain, width);
  drawNowLine(ctx, domain, width, nowMs);
}
