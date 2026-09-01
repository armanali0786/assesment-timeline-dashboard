import { BAND_COLORS, MARKER_COLORS } from "./colors";
import { computeAxisTicks } from "./geometry";
import { AXIS_Y, BAND_HEIGHT, BAND_TOP, MARKER_RADIUS } from "./layout";
import { formatIstTime } from "@/utils/time";
import type { PaintGeometry } from "./geometry";
import type { Domain } from "./types";

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, MARKER_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

export function paintChart(ctx: CanvasRenderingContext2D, geometry: PaintGeometry, domain: Domain, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  for (const rect of geometry.bandRects) {
    ctx.fillStyle = BAND_COLORS[rect.kind];
    ctx.fillRect(rect.x, BAND_TOP, Math.max(rect.width, 0.5), BAND_HEIGHT);
  }

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

  ctx.strokeStyle = "#e0e0e0";
  ctx.fillStyle = "#616161";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  for (const tick of computeAxisTicks(domain, width)) {
    ctx.beginPath();
    ctx.moveTo(tick.x, BAND_TOP);
    ctx.lineTo(tick.x, AXIS_Y - 14);
    ctx.stroke();
    ctx.fillText(formatIstTime(new Date(tick.ms).toISOString()), tick.x, AXIS_Y);
  }
}
