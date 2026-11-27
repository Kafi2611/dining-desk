"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { tokenService } from "@/lib/container";
import type { FormState } from "@/lib/actions/wallet";
import { assertRole } from "@/lib/services/authorization";
import { TokenError } from "@/lib/services/token-errors";
import { WalletError } from "@/lib/services/wallet-errors";
import { buyTokenSchema } from "@/lib/validators/token";

// Server actions stay thin: check the role, validate with Zod, call the service.
async function currentStudentId() {
  const session = await auth();
  if (!session?.user) throw new Error("Not logged in");
  assertRole(session.user, "STUDENT");
  return Number(session.user.id);
}

async function run(work: () => Promise<string>): Promise<FormState> {
  try {
    const ok = await work();
    revalidatePath("/student", "layout");
    return { ok };
  } catch (e) {
    if (e instanceof TokenError || e instanceof WalletError) return { error: e.message };
    throw e;
  }
}

function parse(formData: FormData) {
  return buyTokenSchema.safeParse({
    mealType: formData.get("mealType"),
    date: formData.get("date"),
  });
}

export async function buyTokenAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await currentStudentId();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await tokenService.buyToken(userId, parsed.data.mealType, parsed.data.date);
    return "Token bought";
  });
}

export async function buyGuestCouponAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await currentStudentId();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await tokenService.buyGuestCoupon(userId, parsed.data.mealType, parsed.data.date);
    return "Guest coupon bought";
  });
}
