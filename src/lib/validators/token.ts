import { z } from "zod";

export const buyTokenSchema = z.object({
  mealType: z.enum(["LUNCH", "DINNER", "BOTH"], { error: "Choose Lunch, Dinner or Both" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});
