"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { walletService } from "@/lib/container";
import { assertRole } from "@/lib/services/authorization";
import { WalletError } from "@/lib/services/wallet-errors";
import {
  rechargeOfflineSchema,
  rechargeOnlineSchema,
  transferSchema,
} from "@/lib/validators/wallet";

export type FormState = { ok: string } | { error: string } | null;

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
    revalidatePath("/student");
    return { ok };
  } catch (e) {
    if (e instanceof WalletError) return { error: e.message };
    throw e;
  }
}

export async function rechargeOnlineAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await currentStudentId();
  const parsed = rechargeOnlineSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await walletService.rechargeOnline(userId, parsed.data.amount);
    return "Recharge done";
  });
}

export async function requestOfflineAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await currentStudentId();
  const parsed = rechargeOfflineSchema.safeParse({
    amount: formData.get("amount"),
    reference: formData.get("reference"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await walletService.requestOffline(userId, parsed.data.amount, parsed.data.reference);
    return "Request sent. Wait for the manager";
  });
}

export async function transferAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const userId = await currentStudentId();
  const parsed = transferSchema.safeParse({
    recipientRoll: formData.get("recipientRoll"),
    amount: formData.get("amount"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    const { recipientRoll, amount, password } = parsed.data;
    await walletService.transfer(userId, recipientRoll, amount, password);
    return "Money sent";
  });
}
