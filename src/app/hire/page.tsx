import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Hiring | Warmpath",
  description: "Post roles, share one link, collect applications and referrals from your network.",
};

export default function HireMarketingPage() {
  return (
    <div className="flex min-h-full flex-col bg-warm-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm-accent">For hiring teams</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-warm-ink">
          Run warm-intro hiring in one place
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-warm-muted">
          Create a role, add your company and match bonus, and share a single public link. People can
          apply themselves or refer someone—with context you can actually use.
        </p>
        <ul className="mt-10 space-y-4 text-warm-muted">
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-accent text-xs font-bold text-white">
              1
            </span>
            <span>
              <strong className="text-warm-ink">Create roles</strong> with location, description, and
              optional match bonus for referrers.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-accent text-xs font-bold text-white">
              2
            </span>
            <span>
              <strong className="text-warm-ink">Share your link</strong> privately or broadly—no job
              board noise.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-accent text-xs font-bold text-white">
              3
            </span>
            <span>
              <strong className="text-warm-ink">Review submissions</strong> by email, move the role
              through stages, and close when you’re done.
            </span>
          </li>
        </ul>
        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/hire/sign-up"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-warm-accent px-6 text-sm font-semibold text-white hover:bg-warm-accent-hover"
          >
            Create hiring account
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-stone-300 bg-white px-6 text-sm font-semibold text-warm-ink hover:bg-stone-50"
          >
            General sign-in
          </Link>
        </div>
        <p className="mt-8 text-sm text-warm-muted">
          Hiring managers use the green button. Applying or referring on a job link? Use general sign-in.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
