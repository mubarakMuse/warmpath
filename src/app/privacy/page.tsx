import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Privacy Policy | Warmpath",
  description: "How Warmpath handles your information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col bg-warm-canvas">
      <SiteHeader />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-14">
        <h1 className="font-serif text-3xl font-semibold text-warm-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-warm-muted">Last updated {new Date().getFullYear()}</p>
        <div className="mt-10 max-w-none space-y-6 text-sm leading-relaxed text-warm-muted">
          <p>
            Warmpath (“we”, “us”) provides hiring and referral tools. This policy describes how we
            handle information when you use our website and product.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Information we collect</h2>
          <p>
            We collect information you provide: for example name, email, access codes, role
            descriptions, company details, and submissions (including referrer and candidate
            details). We also collect technical data such as logs and cookies needed to run the
            service.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">How we use it</h2>
          <p>
            We use this data to operate Warmpath, authenticate users, display role pages, deliver
            submissions to hiring managers, and improve reliability and security.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Sharing</h2>
          <p>
            We use infrastructure providers (e.g. hosting, database) to run the product. We do not
            sell your personal information. We may disclose information if required by law.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Retention</h2>
          <p>
            We retain data as long as your account is active or as needed to provide the service.
            You may request deletion of your account data where applicable law allows.
          </p>
          <h2 className="text-base font-semibold text-warm-ink">Contact</h2>
          <p>
            Questions about privacy: contact the operator of your Warmpath deployment (your team’s
            admin or the email shown on your instance).
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
