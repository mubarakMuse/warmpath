import { RoleDescription, RoleDescriptionEmpty } from "@/components/role-description";
import { roleStatusLabel } from "@/lib/role-status";

type Role = {
  title: string;
  description: string | null;
  location: string | null;
  match_bonus: string | null;
  hirer_full_name: string | null;
  hirer_avatar_url: string | null;
  company_name: string | null;
  company_website: string | null;
  company_linkedin_url: string | null;
  company_logo_url: string | null;
  status: string;
};

export function PublicRoleHero({ role }: { role: Role }) {
  const hirer = role.hirer_full_name?.trim() || "The hiring team";
  const company = role.company_name?.trim();
  const statusLabel = roleStatusLabel(role.status);
  const bonus = role.match_bonus?.trim();

  return (
    <div className="min-w-0 space-y-8">
      {/* Hiring line: name + “is hiring for this role” · company logo on the right */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {role.hirer_avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={role.hirer_avatar_url}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-stone-200"
            />
          ) : (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-stone-200 text-sm font-bold text-warm-muted ring-1 ring-stone-200"
              aria-hidden
            >
              {hirer.slice(0, 1).toUpperCase()}
            </div>
          )}
          <p className="text-sm leading-snug text-warm-muted">
            <span className="font-semibold text-warm-ink">{hirer}</span> is hiring for this role
          </p>
        </div>
        {role.company_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={role.company_logo_url}
            alt={company ? `${company} logo` : "Company logo"}
            className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-stone-200 sm:h-14 sm:w-14"
          />
        ) : null}
      </div>

      {/* Title + at Company */}
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-warm-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
          {role.title}
        </h1>
        {company ? (
          <p className="mt-3 text-lg font-semibold text-warm-ink sm:text-xl">
            at <span className="font-bold">{company}</span>
          </p>
        ) : null}

        {/* Pills: referral bonus + status (no status dot) */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {bonus ? (
            <span className="inline-flex items-center rounded-full bg-stone-200/90 px-3.5 py-1.5 text-xs font-semibold text-warm-ink">
              Referral bonus · {bonus}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-stone-200/90 px-3.5 py-1.5 text-xs font-semibold text-warm-ink">
            {statusLabel}
          </span>
        </div>

        {/* Location bar */}
        {role.location?.trim() ? (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl bg-stone-100 px-4 py-3.5 text-sm">
            <div className="flex min-w-0 items-center gap-2.5 text-warm-ink">
              <svg
                className="h-5 w-5 shrink-0 text-warm-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <span className="font-medium">{role.location.trim()}</span>
            </div>
            <a
              href="#about-role"
              className="shrink-0 text-sm font-semibold text-warm-accent hover:text-warm-accent-hover"
            >
              View details
            </a>
          </div>
        ) : null}
      </div>

      {/* About */}
      <section id="about-role" className="scroll-mt-24">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-muted">
          About this role
        </h2>
        <div className="mt-5 rounded-2xl border border-stone-200/90 bg-gradient-to-b from-white to-stone-50/80 px-5 py-5 shadow-sm sm:px-6 sm:py-6">
          {role.description?.trim() ? (
            <RoleDescription text={role.description} variant="public" />
          ) : (
            <RoleDescriptionEmpty className="text-[15px] italic text-warm-muted" />
          )}
        </div>

        {(role.company_website || role.company_linkedin_url) && (
          <div className="mt-8 flex flex-wrap gap-4 border-t border-stone-200 pt-6 text-sm">
            {role.company_website ? (
              <a
                href={role.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-warm-accent hover:text-warm-accent-hover"
              >
                Company website →
              </a>
            ) : null}
            {role.company_linkedin_url ? (
              <a
                href={role.company_linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-warm-accent hover:text-warm-accent-hover"
              >
                LinkedIn company page →
              </a>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
