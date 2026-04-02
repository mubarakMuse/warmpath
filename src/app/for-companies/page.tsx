import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "For companies | Warmpath",
  description:
    "Hire through trusted recommendations—share a role link, optional match bonus, and warm intros instead of resume noise.",
};

function LoginToHireCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/hire/sign-up"
      className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-warm-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-warm-accent-hover ${className}`}
    >
      Log in to hire
    </Link>
  );
}

function CreateAccountCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/hire/sign-up"
      className={`inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-stone-300 bg-white px-6 text-sm font-semibold text-warm-ink transition hover:bg-stone-50 ${className}`}
    >
      Create hiring account
    </Link>
  );
}

const qualityPillars = [
  {
    title: "Quality without the noise",
    subtitle: "Only invest where it matters",
    body: "No upfront platform fees for the basics—publish roles, share links, and collect intros on your terms. Optional match bonus is yours to define.",
  },
  {
    title: "Quality over quantity",
    subtitle: "Five right fits beat five hundred resumes",
    body: "Suggestions travel with context: who they are, how someone knows them, and why they fit—so you review people, not keyword stacks.",
  },
  {
    title: "Access hidden gems",
    subtitle: "Beyond the obvious applicants",
    body: "Your link can reach second- and third-degree connections when people reshare—surfacing candidates who were not actively applying.",
  },
];

const hirerSteps = [
  {
    title: "Create your search, add a match bonus, get a link",
    body: "Each role becomes a public page with title, location, pipeline stage, and optional match bonus copy—plus apply and refer flows.",
  },
  {
    title: "Share as broadly or as quietly as you want",
    body: "Drop the link in Slack, email, or DMs. Your network decides how far it travels.",
  },
  {
    title: "Review submissions and move the pipeline",
    body: "Track who raised their hand or referred someone, then update status from draft through closed—without standing up a full ATS.",
  },
];

const faqs = [
  {
    q: "What is Warmpath?",
    a: "Hiring software for publishing role pages your network can share. Each role has a public link for self-applications and referrals, optional match bonus messaging, and a simple pipeline. You review submissions and run the process your way.",
  },
  {
    q: "How is this different from a job board?",
    a: "You control who sees the link. Candidates and referrers respond in a structured flow with context—not anonymous applies—so you get fewer, higher-signal conversations.",
  },
  {
    q: "How does sharing a link help?",
    a: "You share once; people in your network can forward it or refer someone. That reaches pockets of second- and third-degree connections you would not hit with a single post.",
  },
  {
    q: "Who is Warmpath for?",
    a: "Hiring managers and teams where quality matters—leadership, first-of-kind hires, senior ICs, and other high-stakes roles. Recruiters can use it as a supplementary pipeline: submissions stay tied to email so you can review with the hiring manager.",
  },
  {
    q: "How do match bonuses work?",
    a: "You choose whether to show match bonus copy on each role and what it says. Warmpath does not process payments—you define terms and timing with candidates and referrers outside the product.",
  },
  {
    q: "How do I log in?",
    a: "Use Google or an email magic link on the hiring sign-up page (/hire/sign-up). Your session stays active until you log out.",
  },
];

export default function ForCompaniesPage() {
  return (
    <div className="flex min-h-full flex-col bg-warm-canvas">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-14 md:pb-20 md:pt-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm">
                <span className="text-lg" aria-hidden>
                  👋
                </span>
                <div>
                  <p className="font-medium text-warm-ink">You&apos;re hiring</p>
                  <p className="text-warm-muted">
                    at <span className="font-semibold text-warm-ink">Acme Inc.</span>
                    <span className="text-xs text-stone-400"> — your company on every role page</span>
                  </p>
                </div>
              </div>

              <h1 className="mt-10 font-serif text-4xl font-semibold leading-tight tracking-tight text-warm-ink md:text-5xl md:leading-[1.1]">
                Win the hiring lottery
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-warm-muted md:text-xl">
                Find exceptional talent through trusted recommendations—not another pile of unvetted
                resumes.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <LoginToHireCta />
                <CreateAccountCta />
              </div>
            </div>

            <div className="hidden rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center lg:block lg:max-w-xs">
              <p className="text-4xl" aria-hidden>
                👋
              </p>
              <p className="mt-4 text-sm font-medium text-warm-ink">Your next hire is a warm intro away</p>
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-stone-200/80 bg-white/70 py-10">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm-muted">
              Built for teams that hire through people
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-warm-muted">
              Startups and growth companies use Warmpath for roles where a referral beats a job post—
              from leadership and GTM to product, design, and critical IC hires.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["High-trust intros", "Optional match bonus", "One link per role", "No ATS required"].map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-full border border-stone-200 bg-warm-canvas px-4 py-1.5 text-xs font-medium text-warm-ink"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* Three pillars */}
        <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <h2 className="text-center font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
            Quality without the noise
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {qualityPillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-accent">
                  {p.subtitle}
                </p>
                <h3 className="mt-2 font-serif text-lg font-semibold text-warm-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-warm-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-stone-200/80 bg-stone-50/50 py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-center font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
              How hiring works on Warmpath
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-warm-muted">
              For hiring managers: publish a role, share one link, and run submissions through a simple
              pipeline—without standing up a full ATS.
            </p>

            <div className="mx-auto mt-14 max-w-2xl">
              <ol className="space-y-8">
                {hirerSteps.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-accent text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-warm-ink">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-warm-muted">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-sm text-warm-muted">
                Stronger hires come from clearer stories and faster feedback loops—less time lost to
                cold outreach.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LoginToHireCta />
                <CreateAccountCta />
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <h2 className="text-center font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
            A radically better way to hire
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80">
                  <th className="px-4 py-3 font-semibold text-warm-ink" />
                  <th className="px-4 py-3 font-semibold text-warm-muted">Executive search</th>
                  <th className="px-4 py-3 font-semibold text-warm-muted">LinkedIn &amp; job posts</th>
                  <th className="px-4 py-3 font-semibold text-warm-accent">Warmpath</th>
                </tr>
              </thead>
              <tbody className="text-warm-muted">
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 font-medium text-warm-ink">Cost model</th>
                  <td className="px-4 py-3">Often six figures per retained search</td>
                  <td className="px-4 py-3">Ads, seats, and recruiter time add up fast</td>
                  <td className="px-4 py-3 font-medium text-warm-ink">
                    Publish and share; you set match bonus terms outside the product
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 font-medium text-warm-ink">Signal per intro</th>
                  <td className="px-4 py-3">High touch, low volume</td>
                  <td className="px-4 py-3">Very noisy; most applicants are a poor fit</td>
                  <td className="px-4 py-3 font-medium text-warm-ink">
                    Warm intros first—context travels with every suggestion
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <th className="px-4 py-3 font-medium text-warm-ink">Time to traction</th>
                  <td className="px-4 py-3">Months for senior mandates</td>
                  <td className="px-4 py-3">Always on, rarely efficient</td>
                  <td className="px-4 py-3 font-medium text-warm-ink">
                    Share a link today; velocity follows your network
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-3 font-medium text-warm-ink">Long-term benefit</th>
                  <td className="px-4 py-3">Relationship with one firm</td>
                  <td className="px-4 py-3">Feed-driven, easy to forget</td>
                  <td className="px-4 py-3 font-medium text-warm-ink">
                    Your hiring graph and reputation compound with every role
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-stone-200/80 bg-white/60 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
              Frequently asked questions
            </h2>
            <dl className="mt-12 space-y-10">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-warm-ink">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-warm-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-4 md:pb-28">
          <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 px-8 py-14 text-center shadow-sm md:px-16">
            <h2 className="font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
              Stop searching, start connecting.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-warm-muted">
              Log in to publish roles and collect intros—or create an account to put your company on
              every shareable link.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LoginToHireCta />
              <CreateAccountCta />
            </div>
            <p className="mt-10 text-xs text-warm-muted">
              Questions?{" "}
              <a href="mailto:hello@warmpath.com" className="font-medium text-warm-accent hover:underline">
                hello@warmpath.com
              </a>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
