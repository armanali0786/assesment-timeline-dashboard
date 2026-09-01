import { useMemo } from "react";
import type { Shift, TimeRange } from "@/api/types";
import { computeShiftWindowUtc, generateShiftWindows, type ShiftWindowOption } from "@/utils/shift";

export function useShiftWindowOptions(shifts: Shift[] | undefined): ShiftWindowOption[] {
  return useMemo(() => (shifts ?? []).flatMap(generateShiftWindows), [shifts]);
}

export function useShiftTimeRange(dateStr: string | null, window: ShiftWindowOption | null): TimeRange | null {
  return useMemo(() => {
    if (!dateStr || !window) return null;
    const { fromTs, toTs } = computeShiftWindowUtc(dateStr, window);
    return { from_ts: fromTs.toISOString(), to_ts: toTs.toISOString() };
  }, [dateStr, window]);
}
