// Pattern: Observer (behavioral).
// GoF role: these are the events (the state changes) that the Subject (EventBus) tells the Observers about.

export interface RechargeApproved {
  type: "RechargeApproved";
  userId: number;
  amount: number;
}

export interface RechargeRejected {
  type: "RechargeRejected";
  userId: number;
  amount: number;
}

export interface MoneyReceived {
  type: "MoneyReceived";
  userId: number;
  amount: number;
  fromName: string;
}

export interface LowBalance {
  type: "LowBalance";
  userId: number;
  balance: number;
}

export type DiningEvent = RechargeApproved | RechargeRejected | MoneyReceived | LowBalance;
export type DiningEventType = DiningEvent["type"];
