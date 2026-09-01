import type { Shift } from "@/api/types";
import { addDaysToDateString, istWallClockToUtc } from "./time";

export interface ShiftWindowOption {
  id: string;
  shiftId: string;
  label: string;
  startHHMM: string;
  endHHMM: string;
  crossesMidnight: boolean;
}

function minutesOfDay(hhmm: string): number {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

/** Each shift_timings entry starts a shift that runs until the next entry; the last wraps to the first. */
export function generateShiftWindows(shift: Shift): ShiftWindowOption[] {
  return shift.shift_timings.map((start, index) => {
    const end = shift.shift_timings[(index + 1) % shift.shift_timings.length];
    return {
      id: `${shift.id}:${index}`,
      shiftId: shift.id,
      label: `${shift.name} (${start} – ${end})`,
      startHHMM: start,
      endHHMM: end,
      crossesMidnight: minutesOfDay(end) <= minutesOfDay(start),
    };
  });
}

export function computeShiftWindowUtc(dateStr: string, window: ShiftWindowOption): { fromTs: Date; toTs: Date } {
  const fromTs = istWallClockToUtc(dateStr, window.startHHMM);
  const endDateStr = window.crossesMidnight ? addDaysToDateString(dateStr, 1) : dateStr;
  const toTs = istWallClockToUtc(endDateStr, window.endHHMM);
  return { fromTs, toTs };
}
