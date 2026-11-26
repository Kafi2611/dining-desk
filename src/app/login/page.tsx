import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathFor } from "@/lib/auth-guard";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(homePathFor(session.user.role));

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">DiningDesk: Log in</h1>
      <LoginForm />
    </main>
  );
}
