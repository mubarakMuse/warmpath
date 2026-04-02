import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import { LogoWordmark } from "@/components/brand-logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const row = await getAdminSessionProfile();
  if (!row) {
    redirect("/login?error=admin");
  }

  return (
    <div className="min-h-full bg-warm-canvas">
      <header className="border-b border-stone-200 bg-white/90">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6">
            <LogoWordmark href="/admin/dashboard" markSize={28} />
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-accent">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-warm-muted">
            <Link href="/admin/dashboard" className="hover:text-warm-accent">
              Dashboard
            </Link>
            <Link href="/hire/dashboard" className="hover:text-warm-accent">
              Hiring
            </Link>
            <Link href="/" className="hover:text-warm-accent">
              Home
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
