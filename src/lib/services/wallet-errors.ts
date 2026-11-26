export type WalletErrorCode =
  | "INVALID_AMOUNT"
  | "BELOW_MINIMUM"
  | "ALREADY_REQUESTED_TODAY"
  | "PAYMENT_FAILED"
  | "WRONG_PASSWORD"
  | "RECIPIENT_NOT_FOUND"
  | "DIFFERENT_HALL"
  | "SELF_TRANSFER"
  | "INSUFFICIENT_BALANCE"
  | "REQUEST_NOT_FOUND"
  | "REQUEST_NOT_PENDING"
  | "NO_WALLET";

// One error type for every wallet rule. The page shows `message`.
export class WalletError extends Error {
  constructor(
    readonly code: WalletErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WalletError";
  }
}
