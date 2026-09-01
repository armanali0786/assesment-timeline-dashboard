import { useCallback, useEffect, useState, type PointerEvent, type RefObject } from "react";
import { timeToX, xToTime } from "./geometry";
import { HOVER_HIT_PX, MIN_DRAG_PX, MIN_ZOOM_SPAN_MS } from "./layout";
import { findNearestMarkerIndex } from "./search";
import type { Domain, Marker } from "./types";

export interface BrushRange {
  startX: number;
  currentX: number;
}

export interface Hover {
  markerIndex: number;
  clientX: number;
  clientY: number;
}

interface UseChartInteractionsArgs {
  canvasRef: RefObject<HTMLCanvasElement>;
  markers: Marker[];
  fullDomain: Domain;
  width: number;
}

export function useChartInteractions({ canvasRef, markers, fullDomain, width }: UseChartInteractionsArgs) {
  const [domain, setDomain] = useState(fullDomain);
  const [brush, setBrush] = useState<BrushRange | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  useEffect(() => setDomain(fullDomain), [fullDomain]);

  const localX = useCallback(
    (clientX: number) => clientX - (canvasRef.current?.getBoundingClientRect().left ?? 0),
    [canvasRef],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (!event.shiftKey || width === 0) return;
      const x = localX(event.clientX);
      setBrush({ startX: x, currentX: x });
    },
    [localX, width],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (width === 0) return;
      const x = localX(event.clientX);

      if (brush) {
        setBrush({ startX: brush.startX, currentX: x });
        return;
      }

      const targetMs = xToTime(x, domain, width);
      const nearestIndex = findNearestMarkerIndex(markers, targetMs);
      if (nearestIndex === null) {
        setHover(null);
        return;
      }

      const nearestX = timeToX(markers[nearestIndex].timeMs, domain, width);
      if (Math.abs(nearestX - x) > HOVER_HIT_PX) {
        setHover(null);
        return;
      }
      setHover({ markerIndex: nearestIndex, clientX: event.clientX, clientY: event.clientY });
    },
    [brush, domain, localX, markers, width],
  );

  const handlePointerUp = useCallback(() => {
    if (!brush || width === 0) {
      setBrush(null);
      return;
    }

    const left = Math.min(brush.startX, brush.currentX);
    const right = Math.max(brush.startX, brush.currentX);
    setBrush(null);
    if (right - left < MIN_DRAG_PX) return;

    let newFrom = xToTime(left, domain, width);
    let newTo = xToTime(right, domain, width);
    if (newTo - newFrom < MIN_ZOOM_SPAN_MS) {
      const mid = (newFrom + newTo) / 2;
      newFrom = mid - MIN_ZOOM_SPAN_MS / 2;
      newTo = mid + MIN_ZOOM_SPAN_MS / 2;
    }
    setDomain({ fromMs: newFrom, toMs: newTo });
  }, [brush, domain, width]);

  const handlePointerLeave = useCallback(() => {
    setBrush(null);
    setHover(null);
  }, []);

  const handleDoubleClick = useCallback(() => setDomain(fullDomain), [fullDomain]);

  return { domain, brush, hover, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerLeave, handleDoubleClick };
}
