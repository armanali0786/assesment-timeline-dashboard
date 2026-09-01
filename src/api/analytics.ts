import { httpClient } from "./httpClient";
import type { CycleTimeBucket, CycleTimeMetricsRequest, MachineIntervalsRequest, MachineIntervalsResponse } from "./types";

export function fetchMachineIntervals(request: MachineIntervalsRequest): Promise<MachineIntervalsResponse> {
  return httpClient.post<MachineIntervalsResponse>("/analytics-query/machine-intervals", request).then((res) => res.data);
}

export function fetchCycleTimeMetrics(request: CycleTimeMetricsRequest): Promise<CycleTimeBucket[]> {
  return httpClient.post<CycleTimeBucket[]>("/analytics-query", request).then((res) => res.data);
}
