"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validators/login";

export async function loginAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const parsed = loginSchema.safeParse({
    roll: formData.get("roll"),
    password: formData.get("password"),
  });
  if (!parsed.success) return parsed.error.issues[0].message;

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) return "Wrong roll or password";
    throw e;
  }
  redirect("/");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
