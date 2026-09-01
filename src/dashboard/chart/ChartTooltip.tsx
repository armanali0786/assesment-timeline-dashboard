import { Paper, Typography } from "@mui/material";
import { formatIstDateTime, formatIstTime } from "@/utils/time";
import type { Marker } from "./types";

const HALF_HOUR_MS = 30 * 60 * 1000;

interface ChartTooltipProps {
  marker: Marker;
  clientX: number;
  clientY: number;
}

export function ChartTooltip({ marker, clientX, clientY }: ChartTooltipProps) {
  const label =
    marker.count === 1
      ? formatIstDateTime(new Date(marker.timeMs).toISOString())
      : hourRangeLabel(marker.timeMs);

  return (
    <Paper
      elevation={4}
      sx={{
        position: "fixed",
        left: clientX + 12,
        top: clientY + 12,
        px: 1.5,
        py: 0.75,
        pointerEvents: "none",
        zIndex: 1300,
      }}
    >
      <Typography variant="caption" display="block" fontWeight={600}>
        {marker.result}
        {marker.count > 1 ? ` × ${marker.count}` : ""}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

function hourRangeLabel(midpointMs: number): string {
  const hourStart = new Date(midpointMs - HALF_HOUR_MS).toISOString();
  const hourEnd = new Date(midpointMs + HALF_HOUR_MS).toISOString();
  return `${formatIstTime(hourStart)} – ${formatIstTime(hourEnd)}`;
}
