import { z } from "zod";

export const loginSchema = z.object({
  roll: z.string().trim().min(1, "Roll is required"),
  password: z.string().min(1, "Password is required"),
});
