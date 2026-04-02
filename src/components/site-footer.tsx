import Link from "next/link";
import { LogoWordmark } from "@/components/brand-logo";

export function SiteFooter() {
  const y = new Date().getFullYear();
  return (
    <footer className="border-t border-stone-200 bg-white/50 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <LogoWordmark href="/" markSize={32} />
          <p className="mt-3 max-w-xs text-sm text-warm-muted">
            Hiring software for teams that run searches through warm intros—one link per role.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link href="/for-companies" className="text-warm-muted hover:text-warm-accent">
            For companies
          </Link>
          <Link href="/hire" className="text-warm-muted hover:text-warm-accent">
            Hiring
          </Link>
          <Link href="/login" className="text-warm-muted hover:text-warm-accent">
            Log in
          </Link>
          <Link href="/privacy" className="text-warm-muted hover:text-warm-accent">
            Privacy
          </Link>
          <Link href="/terms" className="text-warm-muted hover:text-warm-accent">
            Terms
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-5xl px-6 text-center text-xs text-warm-muted md:text-left">
        © {y} Warmpath. All rights reserved.
      </p>
    </footer>
  );
}
