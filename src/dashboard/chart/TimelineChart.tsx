import { useMemo } from "react";
import { Paper, Stack, Typography } from "@mui/material";
import { buildBands, buildCoarseMarkers, buildExactMarkers } from "./normalize";
import { TimelineCanvas } from "./TimelineCanvas";
import { Legend } from "./Legend";
import type { MachineIntervalsResponse, TimeRange } from "@/api/types";

interface TimelineChartProps {
  intervals: MachineIntervalsResponse;
  timeRange: TimeRange;
  showIndividualProduces: boolean;
}

export function TimelineChart({ intervals, timeRange, showIndividualProduces }: TimelineChartProps) {
  const bands = useMemo(() => buildBands(intervals), [intervals]);

  const markers = useMemo(
    () => (showIndividualProduces ? buildExactMarkers(intervals.produces ?? []) : buildCoarseMarkers(intervals.produce_counts)),
    [intervals, showIndividualProduces],
  );

  const fullDomain = useMemo(
    () => ({ fromMs: Date.parse(timeRange.from_ts), toMs: Date.parse(timeRange.to_ts) }),
    [timeRange],
  );

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
        <Typography variant="subtitle1">Production History</Typography>
        <Legend />
      </Stack>

      <TimelineCanvas bands={bands} markers={markers} fullDomain={fullDomain} />

      <Typography variant="caption" color="text.secondary" mt={1} display="block">
        Shift + drag to zoom into a time range · double-click to reset · {markers.length.toLocaleString()} produce markers
      </Typography>
    </Paper>
  );
}
