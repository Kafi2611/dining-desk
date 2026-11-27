"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import type { FormState } from "@/lib/actions/wallet";
import { managerService, walletService } from "@/lib/container";
import { assertRole } from "@/lib/services/authorization";
import { SettingsError } from "@/lib/services/settings-errors";
import { WalletError } from "@/lib/services/wallet-errors";
import { decisionSchema, settingsSchema } from "@/lib/validators/manager";

// Server actions stay thin: check the role, validate with Zod, call the service.
async function currentManagerId() {
  const session = await auth();
  if (!session?.user) throw new Error("Not logged in");
  assertRole(session.user, "MANAGER");
  return Number(session.user.id);
}

async function run(work: () => Promise<string>): Promise<FormState> {
  try {
    const ok = await work();
    revalidatePath("/manager", "layout");
    return { ok };
  } catch (e) {
    if (e instanceof SettingsError || e instanceof WalletError) return { error: e.message };
    throw e;
  }
}

export async function updateSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await currentManagerId();
  const parsed = settingsSchema.safeParse({
    mealRate: formData.get("mealRate"),
    guestRate: formData.get("guestRate"),
    cutoffTime: formData.get("cutoffTime"),
    guestDailyLimit: formData.get("guestDailyLimit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await managerService.updateSettings(parsed.data);
    return "Settings saved";
  });
}

export async function approveRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const managerId = await currentManagerId();
  const parsed = decisionSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await walletService.approveOffline(managerId, parsed.data.requestId);
    return "Approved";
  });
}

export async function rejectRequestAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const managerId = await currentManagerId();
  const parsed = decisionSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return run(async () => {
    await walletService.rejectOffline(managerId, parsed.data.requestId);
    return "Rejected";
  });
}
