"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex max-w-xs flex-col gap-3">
      <label className="flex flex-col gap-1">
        Roll
        <input name="roll" className="rounded border px-2 py-1" autoComplete="username" />
      </label>
      <label className="flex flex-col gap-1">
        Password
        <input
          name="password"
          type="password"
          className="rounded border px-2 py-1"
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        Log in
      </button>
    </form>
  );
}
