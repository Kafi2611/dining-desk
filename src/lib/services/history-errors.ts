export type HistoryErrorCode = "INVALID_RANGE";

// The page shows `message`.
export class HistoryError extends Error {
  constructor(
    readonly code: HistoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "HistoryError";
  }
}
