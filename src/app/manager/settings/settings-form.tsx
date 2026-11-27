"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/lib/actions/manager";

const input = "rounded border px-2 py-1";

export function SettingsForm(props: {
  mealRate: number; // Taka
  guestRate: number; // Taka
  cutoffTime: string;
  guestDailyLimit: number;
}) {
  const [state, action, pending] = useActionState(updateSettingsAction, null);
  return (
    <form action={action} className="flex max-w-xs flex-col gap-3">
      <label className="flex flex-col gap-1">
        Meal rate (Tk)
        <input name="mealRate" inputMode="decimal" defaultValue={props.mealRate} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Guest rate (Tk)
        <input name="guestRate" inputMode="decimal" defaultValue={props.guestRate} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Cutoff time (HH:MM, Dhaka)
        <input name="cutoffTime" defaultValue={props.cutoffTime} className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Guest coupons per day (whole hall)
        <input
          name="guestDailyLimit"
          inputMode="numeric"
          defaultValue={props.guestDailyLimit}
          className={input}
        />
      </label>
      {state && "error" in state && (
        <p role="alert" className="text-red-600">
          {state.error}
        </p>
      )}
      {state && "ok" in state && <p className="text-green-700">{state.ok}</p>}
      <button type="submit" disabled={pending} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
        Save settings
      </button>
    </form>
  );
}
