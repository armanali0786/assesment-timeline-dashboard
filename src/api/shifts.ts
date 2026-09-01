import { httpClient } from "./httpClient";
import type { Shift } from "./types";

export function fetchShifts(): Promise<Shift[]> {
  return httpClient.get<Shift[]>("/core/shifts").then((res) => res.data);
}
