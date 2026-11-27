export type TransactionType =
  | "RECHARGE"
  | "MEAL_PURCHASE"
  | "GUEST_PURCHASE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";
export type TransactionMethod = "WALLET" | "BKASH" | "OFFLINE";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REJECTED";
export type RechargeStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WalletRecord {
  id: number;
  userId: number;
  balance: number;
}

export interface NewTransaction {
  walletId: number;
  type: TransactionType;
  method: TransactionMethod;
  amount: number;
  status: TransactionStatus;
  balanceAfter: number;
  note?: string;
}

export interface RechargeRequestRecord {
  id: number;
  userId: number;
  amount: number;
  method: TransactionMethod;
  reference: string;
  status: RechargeStatus;
}

// Everything that must happen inside ONE database transaction.
export interface WalletStore {
  getWalletByUserId(userId: number): Promise<WalletRecord | null>;
  // Both return the new balance. debit throws WalletError("INSUFFICIENT_BALANCE") instead of going below 0.
  debit(walletId: number, amount: number): Promise<number>;
  credit(walletId: number, amount: number): Promise<number>;
  addTransaction(data: NewTransaction): Promise<void>;
  findRechargeRequest(id: number): Promise<RechargeRequestRecord | null>;
  createRechargeRequest(data: {
    userId: number;
    amount: number;
    method: TransactionMethod;
    reference: string;
  }): Promise<RechargeRequestRecord>;
  decideRechargeRequest(
    id: number,
    status: "APPROVED" | "REJECTED",
    decidedById: number,
    decidedAt: Date,
  ): Promise<void>;
  countRechargeRequests(
    userId: number,
    method: TransactionMethod,
    from: Date,
    to: Date,
  ): Promise<number>;
}

export interface WalletRepository extends WalletStore {
  // All-or-nothing: if fn throws, every change made through `tx` is undone.
  transaction<T>(fn: (tx: WalletStore) => Promise<T>): Promise<T>;
}
