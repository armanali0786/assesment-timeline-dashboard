import { Box, Stack, Typography } from "@mui/material";
import { BAND_COLORS, BAND_LABELS, MARKER_COLORS } from "./colors";
import type { BandKind } from "./types";
import type { ProduceResult } from "@/api/types";

const BAND_KINDS: BandKind[] = ["runtime", "unplanned-production", "planned-downtime", "downtime", "stoppage"];
const RESULTS: ProduceResult[] = ["PASS", "FAIL"];

function Swatch({ color }: { color: string }) {
  return <Box width={10} height={10} borderRadius="2px" bgcolor={color} />;
}

export function Legend() {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {BAND_KINDS.map((kind) => (
        <Stack key={kind} direction="row" spacing={0.75} alignItems="center">
          <Swatch color={BAND_COLORS[kind]} />
          <Typography variant="caption">{BAND_LABELS[kind]}</Typography>
        </Stack>
      ))}
      {RESULTS.map((result) => (
        <Stack key={result} direction="row" spacing={0.75} alignItems="center">
          <Box width={8} height={8} borderRadius="50%" bgcolor={MARKER_COLORS[result]} />
          <Typography variant="caption">{result === "PASS" ? "Pass" : "Fail"}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}
