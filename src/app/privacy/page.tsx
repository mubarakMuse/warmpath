import type { Metadata } from "next";
import Link from "next/link";
import { SiteLogo } from "@/app/components/site-logo";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Warmpath collects, uses, and protects information when you use our site and waitlist.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#faf8f5] to-[#f0ebe3]">
      <div className="mx-auto max-w-xl px-6 py-10 md:py-16">
        <SiteLogo />
        <p className="mt-6">
          <Link href="/" className="text-sm font-medium text-amber-800/90 hover:underline">
            ← Home
          </Link>
        </p>
        <h1 className="mt-8 font-serif text-3xl font-semibold text-warm-ink">Privacy policy</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: April 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-warm-muted">
          <section>
            <h2 className="font-semibold text-warm-ink">What we collect</h2>
            <p className="mt-2">
              If you join the waitlist, we store the information you submit (for example, email and any
              optional fields on the form). If you use other Warmpath features, we collect what is needed
              to run those features (such as account and usage data described when you sign up or log in).
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">How we use it</h2>
            <p className="mt-2">
              We use your information to operate the product, respond to you, improve the service, and
              comply with law. We do not sell your personal information.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">Sharing</h2>
            <p className="mt-2">
              We may share data with service providers that help us host, analyze, or deliver the service
              (for example, email or infrastructure), under agreements that protect your information.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">Your choices</h2>
            <p className="mt-2">
              You may contact us to access, correct, or delete your personal information where applicable.
              You can also unsubscribe from marketing emails using the link in those emails.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-warm-ink">Contact</h2>
            <p className="mt-2">
              Questions about this policy: use the contact method shown on the site or in product emails.
            </p>
          </section>
        </div>

        <p className="mt-12 text-center text-xs text-stone-400">
          <Link href="/terms" className="text-amber-800/80 hover:underline">
            Terms of service
          </Link>
        </p>
      </div>
    </div>
  );
}
