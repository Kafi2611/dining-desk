import { z } from "zod";

const transactionTypes = ["RECHARGE", "MEAL_PURCHASE", "GUEST_PURCHASE", "TRANSFER_IN", "TRANSFER_OUT"] as const;
const transactionStatuses = ["PENDING", "COMPLETED", "FAILED", "REJECTED"] as const;

// Empty filter boxes (value "") mean "no filter".
const blankToUndefined = (value: unknown) => (value === "" || value == null ? undefined : value);
const day = z.preprocess(blankToUndefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());

export const historyFilterSchema = z.object({
  type: z.preprocess(blankToUndefined, z.enum(transactionTypes).optional()),
  status: z.preprocess(blankToUndefined, z.enum(transactionStatuses).optional()),
  fromDate: day,
  toDate: day,
});
