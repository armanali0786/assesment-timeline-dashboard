import { useMemo } from "react";
import { Chip, Paper, Stack, Typography } from "@mui/material";
import { buildBands, buildCoarseMarkers, buildExactMarkers } from "./normalize";
import { TimelineCanvas } from "./TimelineCanvas";
import { Legend } from "./Legend";
import { formatIstDateTime } from "@/utils/time";
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

  // Coarse markers sit at hour-bucket midpoints, not real timestamps, so this is only meaningful
  // once "Show individual produces" is on.
  const lastProduceAt = showIndividualProduces && markers.length > 0 ? markers[markers.length - 1].timeMs : null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} flexWrap="wrap" gap={1}>
        <Typography variant="subtitle1">Production History</Typography>
        <Legend />
      </Stack>

      <TimelineCanvas bands={bands} markers={markers} fullDomain={fullDomain} />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1.5}>
        <Chip
          size="small"
          variant="outlined"
          label="Shift + drag to zoom into a time range · double-click to reset"
        />
        <Chip size="small" variant="outlined" label={`${markers.length.toLocaleString()} produce markers`} />
        {lastProduceAt !== null && (
          <Chip
            size="small"
            variant="outlined"
            color="primary"
            label={`Last observed produce at: ${formatIstDateTime(new Date(lastProduceAt).toISOString())}`}
          />
        )}
      </Stack>
    </Paper>
  );
}
