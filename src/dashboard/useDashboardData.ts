import { useQuery } from "@tanstack/react-query";
import { fetchAssetTree } from "@/api/assets";
import { fetchShifts } from "@/api/shifts";
import { fetchCycleTimeMetrics, fetchMachineIntervals } from "@/api/analytics";
import type { EntityScope, TimeRange } from "@/api/types";

export function useAssetTreeQuery() {
  return useQuery({ queryKey: ["asset-tree"], queryFn: fetchAssetTree, staleTime: Infinity });
}

export function useShiftsQuery() {
  return useQuery({ queryKey: ["shifts"], queryFn: fetchShifts, staleTime: Infinity });
}

export function useMachineIntervalsQuery(entityScope: EntityScope | null, timeRange: TimeRange | null, exactProduces: boolean) {
  const hasFilters = entityScope !== null && timeRange !== null;

  return useQuery({
    queryKey: ["machine-intervals", entityScope, timeRange, exactProduces],
    enabled: hasFilters,
    queryFn: () =>
      fetchMachineIntervals({
        entity_scope: entityScope as EntityScope,
        time_range: timeRange as TimeRange,
        produce_counts: true,
        exact_produces: exactProduces,
        group_produce_counts_by_part_model: true,
      }),
  });
}

export function useCycleTimeMetricsQuery(entityScope: EntityScope | null, timeRange: TimeRange | null) {
  const hasFilters = entityScope !== null && timeRange !== null;

  return useQuery({
    queryKey: ["cycle-time-metrics", entityScope, timeRange],
    enabled: hasFilters,
    queryFn: () =>
      fetchCycleTimeMetrics({
        entity_scope: entityScope as EntityScope,
        metrics: ["ideal_cycle_time_seconds", "actual_cycle_time_seconds"],
        time_range: timeRange as TimeRange,
        distribution: "hourly",
      }),
  });
}
