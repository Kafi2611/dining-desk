// Time rules use Asia/Dhaka (UTC+6, no daylight saving).
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Start (inclusive) and end (exclusive) of the Dhaka calendar day that contains `now`.
export function dhakaDayRange(now: Date): { start: Date; end: Date } {
  const dhakaMs = now.getTime() + DHAKA_OFFSET_MS;
  const startMs = Math.floor(dhakaMs / DAY_MS) * DAY_MS - DHAKA_OFFSET_MS;
  return { start: new Date(startMs), end: new Date(startMs + DAY_MS) };
}

// True when the Dhaka clock at `now` is at or after "HH:MM" (for example the cutoff "23:00").
export function isAtOrAfterDhakaTime(now: Date, hhmm: string): boolean {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const dhaka = new Date(now.getTime() + DHAKA_OFFSET_MS);
  const nowMinutes = dhaka.getUTCHours() * 60 + dhaka.getUTCMinutes();
  return nowMinutes >= hours * 60 + minutes;
}
