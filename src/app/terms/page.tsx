import type { Metadata } from "next";
import Link from "next/link";
import { SiteLogo } from "@/app/components/site-logo";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms for using the Warmpath website and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#faf8f5] to-[#f0ebe3]">
      <div className="mx-auto max-w-xl px-6 py-10 md:py-16">
        <SiteLogo />
        <p className="mt-6">
          <Link href="/" className="text-sm font-medium text-amber-800/90 hover:underline">
            ← Home
          </Link>
        </p>
        <h1 className="mt-8 font-serif text-3xl font-semibold text-warm-ink">Terms of service</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-warm-muted">
          <section>
            <h2 className="font-semibold text-warm-ink">Agreement</h2>
            <p className="mt-2">
              By accessing or using Warmpath’s website, waitlist, or related services, you agree to these
              terms. If you do not agree, do not use the service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">The service</h2>
            <p className="mt-2">
              Warmpath provides hiring-related tools and content as described on the site. Features may
              change; we may suspend or discontinue parts of the service with reasonable notice where
              practical.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">Your responsibilities</h2>
            <p className="mt-2">
              You provide accurate information where requested, keep login credentials confidential, and
              use the service lawfully. You are responsible for content you submit and for compliance with
              employment and privacy laws that apply to you.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">Disclaimer</h2>
            <p className="mt-2">
              The service is provided “as is.” To the fullest extent permitted by law, Warmpath disclaims
              warranties of merchantability, fitness for a particular purpose, and non-infringement. We are
              not liable for indirect or consequential damages arising from your use of the service.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">Changes</h2>
            <p className="mt-2">
              We may update these terms. Continued use after changes constitutes acceptance of the updated
              terms. Material changes may be announced on the site or by email where appropriate.
            </p>
          </section>
        </div>

        <p className="mt-12 text-center text-xs text-stone-400">
          <Link href="/privacy" className="text-amber-800/80 hover:underline">
            Privacy policy
          </Link>
        </p>
      </div>
    </div>
  );
}
