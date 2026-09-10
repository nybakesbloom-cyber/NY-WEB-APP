import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import AdminShell from "@/components/admin/AdminShell";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Every page in this group is behind the guard; /admin/login sits outside it.
  if (!session) redirect("/admin/login");

  return <AdminShell session={session}>{children}</AdminShell>;
}
