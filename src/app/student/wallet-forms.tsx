"use client";

import { useActionState } from "react";
import {
  rechargeOnlineAction,
  requestOfflineAction,
  transferAction,
  type FormState,
} from "@/lib/actions/wallet";

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

export function RechargeOnlineForm() {
  const [state, action, pending] = useActionState(rechargeOnlineAction, null);
  return (
    <form action={action} className="flex max-w-xs flex-col gap-3">
      <h2 className="text-lg font-semibold">Recharge with bKash</h2>
      <label className="flex flex-col gap-1">
        Amount (Tk, minimum 500)
        <input name="amount" inputMode="decimal" className={input} />
      </label>
      <Message state={state} />
      <button type="submit" disabled={pending} className={button}>
        Pay with bKash
      </button>
    </form>
  );
}

export function RechargeOfflineForm() {
  const [state, action, pending] = useActionState(requestOfflineAction, null);
  return (
    <form action={action} className="flex max-w-xs flex-col gap-3">
      <h2 className="text-lg font-semibold">Offline recharge request</h2>
      <label className="flex flex-col gap-1">
        Amount (Tk)
        <input name="amount" inputMode="decimal" className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Payment slip / reference
        <input name="reference" className={input} />
      </label>
      <Message state={state} />
      <button type="submit" disabled={pending} className={button}>
        Send request
      </button>
    </form>
  );
}

export function TransferForm() {
  const [state, action, pending] = useActionState(transferAction, null);
  return (
    <form action={action} className="flex max-w-xs flex-col gap-3">
      <h2 className="text-lg font-semibold">Send money (same hall)</h2>
      <label className="flex flex-col gap-1">
        Student roll
        <input name="recipientRoll" className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Amount (Tk)
        <input name="amount" inputMode="decimal" className={input} />
      </label>
      <label className="flex flex-col gap-1">
        Your password
        <input name="password" type="password" autoComplete="current-password" className={input} />
      </label>
      <Message state={state} />
      <button type="submit" disabled={pending} className={button}>
        Send
      </button>
    </form>
  );
}
