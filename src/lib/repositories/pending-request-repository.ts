// One offline recharge request that waits for the manager. Amount is in poisha.
export interface PendingRequestRow {
  id: number;
  roll: string;
  name: string;
  amount: number;
  reference: string;
  createdAt: Date;
}

export interface PendingRequestRepository {
  // Oldest first.
  listPending(): Promise<PendingRequestRow[]>;
}
