// Pattern: Adapter (structural).
// GoF role: BkashClient is the Adaptee, a fake/sandbox bKash API with its own method names. No real keys.

export class BkashTimeoutError extends Error {
  constructor() {
    super("bKash did not answer in time");
    this.name = "BkashTimeoutError";
  }
}

export interface BkashCreateResponse {
  paymentID: string;
}

export interface BkashExecuteResponse {
  transactionStatus: "Completed" | "Failed";
  trxID?: string;
}

// Fake sandbox: every payment completes. Real bKash would call the network here.
export class BkashClient {
  async createPayment(input: {
    amount: string;
    merchantInvoiceNumber: string;
  }): Promise<BkashCreateResponse> {
    return { paymentID: `SANDBOX-${input.merchantInvoiceNumber}` };
  }

  async executePayment(paymentID: string): Promise<BkashExecuteResponse> {
    return { transactionStatus: "Completed", trxID: `TRX-${paymentID}` };
  }
}
