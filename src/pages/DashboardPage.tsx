import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, LinearProgress, Stack } from "@mui/material";
import { AppShell } from "@/layout/AppShell";
import { FilterBar } from "@/dashboard/FilterBar";
import { TimelineChart } from "@/dashboard/chart/TimelineChart";
import { HourlySummaryTable } from "@/dashboard/HourlySummaryTable";
import { EmptyState } from "@/dashboard/EmptyState";
import { buildHourlySummary } from "@/dashboard/bucketing";
import { useAssetTreeQuery, useCycleTimeMetricsQuery, useMachineIntervalsQuery, useShiftsQuery } from "@/dashboard/useDashboardData";
import { useShiftTimeRange, useShiftWindowOptions } from "@/dashboard/useShiftWindow";
import { describeError } from "@/api/types";
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
  const { message: errorMessage, retryable: errorIsRetryable } = describeError(error);

  // downtimes is always gap-filled for the full window, so it's never empty on its own.
  const isEmpty =
    !!intervalsQuery.data && intervalsQuery.data.runtimes.length === 0 && intervalsQuery.data.produce_counts.length === 0;

  const hourRows = useMemo(() => {
    if (!intervalsQuery.data || !timeRange) return null;
    return buildHourlySummary(intervalsQuery.data, cycleTimeQuery.data ?? [], timeRange);
  }, [intervalsQuery.data, cycleTimeQuery.data, timeRange]);

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

        {isFetching && !isLoading && <LinearProgress />}

        {error && (
          <Alert
            severity="error"
            action={
              errorIsRetryable && (
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Retry
                </Button>
              )
            }
          >
            {errorMessage}
          </Alert>
        )}

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          intervalsQuery.data &&
          timeRange &&
          (isEmpty ? (
            <EmptyState />
          ) : (
            <>
              <TimelineChart
                intervals={intervalsQuery.data}
                timeRange={timeRange}
                showIndividualProduces={filters.showIndividualProduces}
              />
              {hourRows && <HourlySummaryTable rows={hourRows} />}
            </>
          ))
        )}
      </Stack>
    </AppShell>
  );
}
