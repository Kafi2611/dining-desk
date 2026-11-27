import Link from "next/link";
import { settings } from "@/lib/container";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const current = await settings.get();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Link href="/manager" className="underline">
          Back to dashboard
        </Link>
      </div>
      <SettingsForm
        mealRate={current.mealRate / 100}
        guestRate={current.guestRate / 100}
        cutoffTime={current.cutoffTime}
        guestDailyLimit={current.guestDailyLimit}
      />
    </div>
  );
}
