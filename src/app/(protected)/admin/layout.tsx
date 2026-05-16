import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { userIsAdmin } from "@/lib/domain/roles";

/** Hard guard on every /admin route (UI link is visible only to ADMIN, but URLs must reject operators). */
export default async function AdminGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!userIsAdmin(session.role)) redirect("/");
  return children;
}
