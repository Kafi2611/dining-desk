export type TokenErrorCode =
  | "AFTER_CUTOFF"
  | "NOT_TOMORROW"
  | "ALREADY_BOUGHT"
  | "GUEST_LIMIT_REACHED"
  | "INSUFFICIENT_BALANCE"
  | "NO_WALLET"
  | "NO_USER";

// One error type for every token rule. The page shows `message`.
export class TokenError extends Error {
  constructor(
    readonly code: TokenErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TokenError";
  }
}
