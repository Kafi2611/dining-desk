// Money is stored as whole poisha (Tk 40 = 4000). This only formats for display.
export function formatTaka(poisha: number): string {
  return `Tk ${(poisha / 100).toFixed(2)}`;
}
