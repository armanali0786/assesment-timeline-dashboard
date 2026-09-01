import { useEffect, useMemo, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { AppShell } from "@/layout/AppShell";
import { FilterBar } from "@/dashboard/FilterBar";
import { TimelineChart } from "@/dashboard/chart/TimelineChart";
import { useAssetTreeQuery, useCycleTimeMetricsQuery, useMachineIntervalsQuery, useShiftsQuery } from "@/dashboard/useDashboardData";
import { useShiftTimeRange, useShiftWindowOptions } from "@/dashboard/useShiftWindow";
import type { DashboardFilters } from "@/dashboard/types";
import { flattenAssetTree, pickDeepestAsset } from "@/utils/assetTree";

const DEFAULT_FILTERS: DashboardFilters = {
  entityScope: null,
  assetLabel: null,
  dateStr: "2026-06-23",
  shiftWindow: null,
  showIndividualProduces: false,
};

export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const assetTreeQuery = useAssetTreeQuery();
  const shiftsQuery = useShiftsQuery();
  const assetOptions = useMemo(() => flattenAssetTree(assetTreeQuery.data ?? []), [assetTreeQuery.data]);
  const shiftWindowOptions = useShiftWindowOptions(shiftsQuery.data);

  useEffect(() => {
    if (filters.entityScope) return;
    const defaultAsset = pickDeepestAsset(assetOptions);
    if (!defaultAsset) return;

    setFilters((prev) => ({
      ...prev,
      assetLabel: defaultAsset.label,
      entityScope: { type: "asset", asset: { asset_id: defaultAsset.id, asset_level_id: defaultAsset.assetLevelId } },
    }));
  }, [assetOptions, filters.entityScope]);

  useEffect(() => {
    if (filters.shiftWindow || shiftWindowOptions.length === 0) return;
    setFilters((prev) => ({ ...prev, shiftWindow: shiftWindowOptions[0] }));
  }, [shiftWindowOptions, filters.shiftWindow]);

  const timeRange = useShiftTimeRange(filters.dateStr, filters.shiftWindow);
  const intervalsQuery = useMachineIntervalsQuery(filters.entityScope, timeRange, filters.showIndividualProduces);
  const cycleTimeQuery = useCycleTimeMetricsQuery(filters.entityScope, timeRange);

  function handleRefresh() {
    intervalsQuery.refetch();
    cycleTimeQuery.refetch();
  }

  const isLoading = intervalsQuery.isLoading || cycleTimeQuery.isLoading;
  const isFetching = intervalsQuery.isFetching || cycleTimeQuery.isFetching;
  const error = intervalsQuery.error ?? cycleTimeQuery.error;

  return (
    <AppShell>
      <Stack spacing={2}>
        <FilterBar
          assetOptions={assetOptions}
          shiftWindowOptions={shiftWindowOptions}
          filters={filters}
          onChange={setFilters}
          onRefresh={handleRefresh}
          refreshing={isFetching}
        />

        {error && <Alert severity="error">{(error as Error).message}</Alert>}

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          intervalsQuery.data &&
          timeRange && (
            <TimelineChart
              intervals={intervalsQuery.data}
              timeRange={timeRange}
              showIndividualProduces={filters.showIndividualProduces}
            />
          )
        )}

        <Typography variant="caption" color="text.secondary">
          cycle-time buckets: {cycleTimeQuery.data?.length ?? 0} · Hourly summary table lands in the next phase.
        </Typography>
      </Stack>
    </AppShell>
  );
}
