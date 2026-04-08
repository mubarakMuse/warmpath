import { redirect } from "next/navigation";
import { AdminAppShell } from "@/app/components/shell/admin-app-shell";
import { isAdminServerSession } from "@/lib/session/admin-session";

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminServerSession())) redirect("/admin/login");
  return <AdminAppShell>{children}</AdminAppShell>;
}
