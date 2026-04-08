import { CompanyCapture } from "@/app/components/company-capture";
import { SiteLogo } from "@/app/components/site-logo";

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#faf8f5] to-[#f0ebe3]">
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-6 py-12 md:py-20">
        <div className="flex justify-center">
          <SiteLogo />
        </div>

        <h1 className="mt-10 text-center font-serif text-3xl font-semibold leading-tight tracking-tight text-warm-ink md:text-4xl">
          Warm introductions for the roles that matter most.
        </h1>

        <p className="mt-5 text-center text-base leading-relaxed text-warm-muted">
          Warmpath helps teams fill critical seats with referrals from people who actually know the work—not spray‑and‑pray
          applicants or anonymous noise. Trusted connectors bring quality candidates; you stay in control of every stage.
        </p>

        <p className="mt-4 text-center text-sm text-stone-500">
          We’re onboarding companies carefully. Join the waitlist and we’ll reach out when there’s a fit.
        </p>

        <CompanyCapture />

        <footer className="mt-auto pt-16 text-center text-xs text-stone-400">
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <a href="/company/login" className="text-amber-800/80 hover:underline">
              Company
            </a>
            <a href="/connect/login" className="text-amber-800/80 hover:underline">
              Connectors
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
