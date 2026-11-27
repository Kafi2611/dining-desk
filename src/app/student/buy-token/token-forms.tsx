"use client";

import { useActionState } from "react";
import { buyGuestCouponAction, buyTokenAction } from "@/lib/actions/tokens";
import type { FormState } from "@/lib/actions/wallet";

function Message({ state }: { state: FormState }) {
  if (!state) return null;
  if ("error" in state) {
    return (
      <p role="alert" className="text-red-600">
        {state.error}
      </p>
    );
  }
  return <p className="text-green-700">{state.ok}</p>;
}

const input = "rounded border px-2 py-1";
const button = "rounded bg-black px-3 py-2 text-white disabled:opacity-50";

interface Props {
  date: string; // tomorrow, "YYYY-MM-DD"
  prices: { single: string; both: string }; // already formatted, for display
}

function MealForm({
  title,
  action,
  submitLabel,
  date,
  prices,
  testId,
}: Props & {
  title: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  testId: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} data-testid={testId} className="flex max-w-xs flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <input type="hidden" name="date" value={date} />
      <label className="flex flex-col gap-1">
        Meal
        <select name="mealType" defaultValue="LUNCH" className={input}>
          <option value="LUNCH">Lunch ({prices.single})</option>
          <option value="DINNER">Dinner ({prices.single})</option>
          <option value="BOTH">Both ({prices.both})</option>
        </select>
      </label>
      <Message state={state} />
      <button type="submit" disabled={pending} className={button}>
        {submitLabel}
      </button>
    </form>
  );
}

export function BuyTokenForm(props: Props) {
  return (
    <MealForm
      {...props}
      title="Meal token"
      action={buyTokenAction}
      submitLabel="Buy token"
      testId="buy-token-form"
    />
  );
}

export function BuyGuestCouponForm(props: Props) {
  return (
    <MealForm
      {...props}
      title="Guest coupon"
      action={buyGuestCouponAction}
      submitLabel="Buy guest coupon"
      testId="buy-guest-form"
    />
  );
}
