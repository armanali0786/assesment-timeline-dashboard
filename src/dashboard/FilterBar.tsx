import RefreshIcon from "@mui/icons-material/Refresh";
import { Autocomplete, Box, Chip, FormControlLabel, IconButton, MenuItem, Paper, Stack, Switch, TextField } from "@mui/material";
import type { FlatAssetOption } from "@/utils/assetTree";
import type { ShiftWindowOption } from "@/utils/shift";
import type { DashboardFilters } from "./types";

interface FilterBarProps {
  assetOptions: FlatAssetOption[];
  shiftWindowOptions: ShiftWindowOption[];
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function FilterBar({ assetOptions, shiftWindowOptions, filters, onChange, onRefresh, refreshing }: FilterBarProps) {
  const selectedAsset = assetOptions.find((option) => option.id === filters.entityScope?.asset.asset_id) ?? null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" useFlexGap>
        <Autocomplete
          size="small"
          sx={{ minWidth: 260 }}
          options={assetOptions}
          getOptionLabel={(option) => `${"  ".repeat(option.depth)}${option.label}`}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedAsset}
          onChange={(_, option) =>
            onChange({
              ...filters,
              assetLabel: option?.label ?? null,
              entityScope: option
                ? { type: "asset", asset: { asset_id: option.id, asset_level_id: option.assetLevelId } }
                : null,
            })
          }
          renderInput={(params) => <TextField {...params} label="Machine / Line" />}
        />

        <TextField
          size="small"
          label="Date"
          type="date"
          value={filters.dateStr}
          onChange={(e) => onChange({ ...filters, dateStr: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          size="small"
          select
          label="Shift"
          sx={{ minWidth: 220 }}
          value={filters.shiftWindow?.id ?? ""}
          onChange={(e) => {
            const next = shiftWindowOptions.find((option) => option.id === e.target.value) ?? null;
            onChange({ ...filters, shiftWindow: next });
          }}
        >
          {shiftWindowOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <FormControlLabel
          control={
            <Switch
              checked={filters.showIndividualProduces}
              onChange={(e) => onChange({ ...filters, showIndividualProduces: e.target.checked })}
            />
          }
          label="Show individual produces"
        />

        <IconButton onClick={onRefresh} disabled={refreshing} aria-label="Refresh">
          <RefreshIcon />
        </IconButton>
      </Stack>

      {filters.assetLabel && filters.shiftWindow && (
        <Box mt={1.5}>
          <Chip
            size="small"
            label={`${filters.assetLabel} · ${filters.dateStr}, ${filters.shiftWindow.startHHMM} – ${filters.shiftWindow.endHHMM} IST`}
          />
        </Box>
      )}
    </Paper>
  );
}
