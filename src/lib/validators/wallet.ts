import { z } from "zod";

// The form sends Taka as text (like "500" or "500.50"). We turn it into whole poisha.
const taka = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 500 or 500.50")
  .transform((value) => Math.round(Number(value) * 100));

export const rechargeOnlineSchema = z.object({ amount: taka });

export const rechargeOfflineSchema = z.object({
  amount: taka,
  reference: z.string().trim().min(1, "Enter the payment slip or reference"),
});

export const transferSchema = z.object({
  recipientRoll: z.string().trim().min(1, "Enter the roll of the student"),
  amount: taka,
  password: z.string().min(1, "Enter your password"),
});
