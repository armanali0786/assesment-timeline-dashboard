import { Paper, Typography } from "@mui/material";

export function EmptyState() {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="subtitle1">No data for this shift</Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        This machine had no recorded activity for the selected date and shift. Data is available for 22–25 June 2026 —
        try a different date, shift, or machine.
      </Typography>
    </Paper>
  );
}
