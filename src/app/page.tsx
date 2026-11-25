import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathFor } from "@/lib/auth-guard";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(homePathFor(session.user.role));
}
