import { z } from "zod";
import { taka } from "@/lib/validators/wallet";

// The form sends text. The service checks the business rules (rates above 0, valid cutoff, limit).
export const settingsSchema = z.object({
  mealRate: taka,
  guestRate: taka,
  cutoffTime: z.string().trim().min(1, "Enter the cutoff time"),
  guestDailyLimit: z
    .string()
    .trim()
    .regex(/^\d+$/, "Guest limit must be a whole number")
    .transform(Number),
});

export const decisionSchema = z.object({
  requestId: z.string().regex(/^\d+$/, "Invalid request").transform(Number),
});
