export const HOUR_MS = 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** A Date whose UTC getters read as IST wall-clock components. Never call getHours()/getMinutes() (local getters) on it. */
function shiftToIst(utcDate: Date): Date {
  return new Date(utcDate.getTime() + IST_OFFSET_MS);
}

export function formatIstTime(iso: string): string {
  const ist = shiftToIst(new Date(iso));
  return `${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}`;
}

export function formatIstDateTime(iso: string): string {
  const ist = shiftToIst(new Date(iso));
  return `${pad(ist.getUTCDate())} ${MONTHS[ist.getUTCMonth()]}, ${pad(ist.getUTCHours())}:${pad(ist.getUTCMinutes())}:${pad(ist.getUTCSeconds())}`;
}

export function istHourLabel(iso: string): string {
  const ist = shiftToIst(new Date(iso));
  const startHour = ist.getUTCHours();
  const endHour = (startHour + 1) % 24;
  return `${pad(startHour)}:00 - ${pad(endHour)}:00`;
}

/** Converts an IST wall-clock date + "HH:MM" into the equivalent UTC instant. */
export function istWallClockToUtc(dateStr: string, hhmm: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = hhmm.split(":").map(Number);
  const wallClockAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  return new Date(wallClockAsUtcMs - IST_OFFSET_MS);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`;
}

/** Epoch ms of the start of the current IST hour, used to cap "in-progress shift" buckets. */
export function currentIstHourStartMs(): number {
  const now = shiftToIst(new Date());
  const hourStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours());
  return hourStart - IST_OFFSET_MS;
}
