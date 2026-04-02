import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Terms of Service | Warmpath",
  description: "Terms for using Warmpath.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col bg-warm-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-14">
        <h1 className="font-serif text-3xl font-semibold text-warm-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-warm-muted">Last updated {new Date().getFullYear()}</p>
        <div className="mt-10 max-w-none space-y-6 text-sm leading-relaxed text-warm-muted">
          <p>
            By using Warmpath you agree to these terms. If you do not agree, do not use the service.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">The service</h2>
          <p>
            Warmpath is provided as-is for hiring teams to share roles and collect applications and
            referrals. Features and availability may change.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Your responsibilities</h2>
          <p>
            You are responsible for the accuracy of role and company information, for complying with
            employment and anti-discrimination laws, and for any match bonus or payments you promise
            candidates or referrers. Warmpath does not process payroll or referral payouts.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Acceptable use</h2>
          <p>
            Do not use Warmpath for unlawful purposes, spam, harassment, or to collect data you are
            not allowed to process. We may suspend access for violations.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Disclaimer</h2>
          <p>
            The service is provided without warranties of any kind. We are not liable for hiring
            decisions, disputes between users, or damages arising from use of the product.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Changes</h2>
          <p>
            We may update these terms. Continued use after changes constitutes acceptance of the
            updated terms.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
