export type SettingsErrorCode = "INVALID_RATE" | "INVALID_CUTOFF" | "INVALID_GUEST_LIMIT";

// The settings form shows `message`.
export class SettingsError extends Error {
  constructor(
    readonly code: SettingsErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SettingsError";
  }
}
