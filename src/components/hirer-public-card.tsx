type RolePublic = {
  hirer_full_name: string | null;
  hirer_linkedin_url: string | null;
  hirer_avatar_url: string | null;
  company_name: string | null;
  company_website: string | null;
  company_linkedin_url: string | null;
  company_logo_url: string | null;
};

function OutLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-warm-accent underline-offset-2 hover:underline"
    >
      {children}
    </a>
  );
}

export function HirerPublicCard({ role }: { role: RolePublic }) {
  const name = role.hirer_full_name?.trim() || "Hiring manager";
  const hasCompany =
    role.company_name ||
    role.company_website ||
    role.company_linkedin_url ||
    role.company_logo_url;

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-muted">
        Hiring team
      </h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        {role.hirer_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-supplied LinkedIn CDN URLs
          <img
            src={role.hirer_avatar_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-stone-200"
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-200 text-lg font-semibold text-warm-muted"
            aria-hidden
          >
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-warm-ink">{name}</p>
          {role.hirer_linkedin_url ? (
            <p className="mt-1 text-sm">
              <OutLink href={role.hirer_linkedin_url}>Hiring manager on LinkedIn</OutLink>
            </p>
          ) : null}
        </div>
      </div>

      {hasCompany ? (
        <div className="mt-6 border-t border-stone-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-warm-muted">
            Company
          </h3>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            {role.company_logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={role.company_logo_url}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-contain ring-1 ring-stone-200"
              />
            ) : null}
            <div className="min-w-0 text-sm">
              {role.company_name ? (
                <p className="font-semibold text-warm-ink">{role.company_name}</p>
              ) : null}
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-warm-muted">
                {role.company_website ? (
                  <OutLink href={role.company_website}>Website</OutLink>
                ) : null}
                {role.company_linkedin_url ? (
                  <OutLink href={role.company_linkedin_url}>Company on LinkedIn</OutLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
