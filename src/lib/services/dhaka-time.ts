// Time rules use Asia/Dhaka (UTC+6, no daylight saving).
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Start (inclusive) and end (exclusive) of the Dhaka calendar day that contains `now`.
export function dhakaDayRange(now: Date): { start: Date; end: Date } {
  const dhakaMs = now.getTime() + DHAKA_OFFSET_MS;
  const startMs = Math.floor(dhakaMs / DAY_MS) * DAY_MS - DHAKA_OFFSET_MS;
  return { start: new Date(startMs), end: new Date(startMs + DAY_MS) };
}
