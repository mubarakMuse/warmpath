import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const pillars = [
  {
    title: "Better fits",
    body: "Referrals arrive with story—who they are, how your contact knows them, and why they match—not a keyword soup.",
  },
  {
    title: "Less noise",
    body: "Each role is one link you share on your terms. No public job board, no feed—just the people you loop in.",
  },
  {
    title: "Match bonus ready",
    body: "Optional match bonus copy on every role so your network knows what’s on the table. You handle payouts your way.",
  },
];

const steps = [
  {
    title: "Set up your company profile",
    body: "Add your name, company, and LinkedIn links once—they show on every public role page.",
  },
  {
    title: "Publish a role",
    body: "Title, location, description, pipeline stage, and optional match bonus. You get a page candidates actually read.",
  },
  {
    title: "Share the link",
    body: "Collect self-applications and referrals in a few clicks. Track submissions by email and move the role through your pipeline.",
  },
];

const faqs = [
  {
    q: "What is Warmpath?",
    a: "Lightweight hiring software for teams that source through networks: one link per role, structured applications and referrals, optional match bonus messaging, and a simple pipeline from draft to closed.",
  },
  {
    q: "Who is it for?",
    a: "Startups and hiring managers who already run searches through intros and DMs—and want a single place to host the role without a heavy ATS.",
  },
  {
    q: "How do I log in?",
    a: "Hiring managers: /hire/sign-up with Google or a magic link. To apply or refer on a role page, use the general sign-in (/login) with Google or a magic link.",
  },
];

type HomeProps = { searchParams: Promise<{ notice?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const q = await searchParams;
  const notice =
    q.notice === "connector"
      ? "connector"
      : q.notice === "connect_signin"
        ? "connect_signin"
        : null;

  return (
    <div className="flex min-h-full flex-col bg-warm-canvas">
      <SiteHeader />

      <main className="flex-1">
        {notice === "connector" ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm text-amber-950">
            Hiring tools live in <strong>Hiring log in</strong>. Connector accounts only use public role
            pages to refer or apply.
          </div>
        ) : null}
        {notice === "connect_signin" ? (
          <div className="border-b border-teal-200 bg-teal-50 px-6 py-3 text-center text-sm text-teal-950">
            Sign in with <strong>Connector log in</strong> on any role page first, then open{" "}
            <Link href="/connect/dashboard" className="font-semibold text-warm-accent underline">
              My activity
            </Link>
            .
          </div>
        ) : null}
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-warm-ink md:text-5xl md:leading-[1.1]">
            Hiring through people you trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-warm-muted md:text-xl">
            Warmpath gives each open role a clear public page: your company story, the job, optional
            match bonus, and paths for candidates to apply or refer someone. Built for warm intros, not
            spray-and-pray applications.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/for-companies"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-warm-accent px-6 text-sm font-semibold text-white hover:bg-warm-accent-hover"
            >
              For companies
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-stone-300 bg-white px-6 text-sm font-semibold text-warm-ink hover:bg-stone-50"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white/60 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
              Why hiring teams use Warmpath
            </h2>
            <p className="mt-3 max-w-2xl text-warm-muted">
              Structured enough to run a search, human enough that your network actually wants to help.
            </p>
            <ul className="mt-12 grid gap-10 md:grid-cols-3">
              {pillars.map((p) => (
                <li key={p.title}>
                  <h3 className="text-lg font-semibold text-warm-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-warm-muted">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
              How it works
            </h2>
            <ol className="mt-12 space-y-10 md:space-y-14">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-6 md:gap-10">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warm-accent text-sm font-bold text-white"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-warm-ink">{s.title}</h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-warm-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-14 text-center text-sm text-warm-muted">
              Ready to post a role?{" "}
              <Link href="/hire" className="font-semibold text-warm-accent hover:underline">
                Hiring overview
              </Link>{" "}
              or{" "}
              <Link href="/login" className="font-semibold text-warm-accent hover:underline">
                log in
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-stone-100/50 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-serif text-2xl font-semibold text-warm-ink md:text-3xl">
              Frequently asked questions
            </h2>
            <dl className="mt-10 space-y-8">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-warm-ink">{item.q}</dt>
                  <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-warm-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
