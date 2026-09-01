import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { formatIstTime } from "@/utils/time";
import type { HourRow } from "./bucketing";

function formatMinutes(value: number): string {
  return `${Math.round(value * 10) / 10} mins`;
}

function formatSeconds(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 10) / 10} secs`;
}

interface RowDef {
  label: string;
  render: (row: HourRow) => string;
}

const ROWS: RowDef[] = [
  { label: "Total", render: (r) => String(r.total) },
  { label: "Pass", render: (r) => String(r.pass) },
  { label: "Fail", render: (r) => String(r.fail) },
  { label: "Runtime", render: (r) => formatMinutes(r.runtimeMinutes) },
  { label: "Planned Downtime", render: (r) => formatMinutes(r.plannedDowntimeMinutes) },
  { label: "Unplanned Production", render: (r) => formatMinutes(r.unplannedProductionMinutes) },
  { label: "Stoppage", render: (r) => formatMinutes(r.stoppageMinutes) },
  { label: "Unknown Downtime", render: (r) => formatMinutes(r.unknownDowntimeMinutes) },
  { label: "Ideal Cycle Time", render: (r) => formatSeconds(r.idealCycleTimeSeconds) },
  { label: "Actual Cycle Time", render: (r) => formatSeconds(r.actualCycleTimeSeconds) },
];

const paramCellSx = {
  position: "sticky" as const,
  left: 0,
  bgcolor: "background.paper",
  fontWeight: 600,
  whiteSpace: "nowrap" as const,
};

const headerCellSx = {
  fontWeight: 700,
  color: "primary.dark",
  whiteSpace: "nowrap" as const,
  borderBottom: "2px solid",
  borderBottomColor: "divider",
};

interface HourlySummaryTableProps {
  rows: HourRow[];
}

export function HourlySummaryTable({ rows }: HourlySummaryTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" mb={1.5}>
        Hourly Production &amp; Downtime Summary
      </Typography>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...paramCellSx, ...headerCellSx }}>Param</TableCell>
              {rows.map((row) => (
                <TableCell key={row.bucket.startMs} align="right" sx={headerCellSx}>
                  {formatIstTime(new Date(row.bucket.startMs).toISOString())} –{" "}
                  {formatIstTime(new Date(row.bucket.endMs).toISOString())}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {ROWS.map((rowDef, index) => (
              <TableRow key={rowDef.label} sx={{ bgcolor: index % 2 === 1 ? "action.hover" : undefined }}>
                <TableCell sx={paramCellSx}>{rowDef.label}</TableCell>
                {rows.map((row) => (
                  <TableCell key={row.bucket.startMs} align="right">
                    {row.isFuture ? "—" : rowDef.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
