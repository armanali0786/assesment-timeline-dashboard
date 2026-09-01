import { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import { buildPaintGeometry } from "./geometry";
import { paintChart } from "./paint";
import { useChartInteractions } from "./useChartInteractions";
import { CHART_HEIGHT } from "./layout";
import { ChartTooltip } from "./ChartTooltip";
import type { Band, Domain, Marker } from "./types";

interface TimelineCanvasProps {
  bands: Band[];
  markers: Marker[];
  fullDomain: Domain;
}

export function TimelineCanvas({ bands, markers, fullDomain }: TimelineCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const { domain, brush, hover, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave, handleDoubleClick } =
    useChartInteractions({ canvasRef, markers, fullDomain, width });

  const geometry = useMemo(
    () => (width > 0 ? buildPaintGeometry(bands, markers, domain, width) : null),
    [bands, markers, domain, width],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !geometry || width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(CHART_HEIGHT * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${CHART_HEIGHT}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const frame = requestAnimationFrame(() => paintChart(ctx, geometry, domain, width, CHART_HEIGHT, Date.now()));
    return () => cancelAnimationFrame(frame);
  }, [geometry, domain, width]);

  const hoveredMarker = hover ? markers[hover.markerIndex] : null;

  return (
    <Box ref={containerRef} position="relative">
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", cursor: "crosshair" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onDoubleClick={handleDoubleClick}
      />

      {brush && (
        <Box
          position="absolute"
          top={0}
          bottom={0}
          left={Math.min(brush.startX, brush.currentX)}
          width={Math.abs(brush.currentX - brush.startX)}
          bgcolor="rgba(21,101,192,0.15)"
          border="1px solid rgba(21,101,192,0.5)"
          sx={{ pointerEvents: "none" }}
        />
      )}

      {hoveredMarker && hover && <ChartTooltip marker={hoveredMarker} clientX={hover.clientX} clientY={hover.clientY} />}
    </Box>
  );
}
