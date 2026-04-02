export const ROLE_STATUSES = [
  "draft",
  "getting_started",
  "sourcing",
  "screening",
  "interviewing",
  "offer",
  "hired",
  "on_hold",
  "closed",
] as const;

export type RoleStatus = (typeof ROLE_STATUSES)[number];

export const ROLE_STATUS_LABELS: Record<RoleStatus, string> = {
  draft: "Draft (public link off)",
  getting_started: "Getting started",
  sourcing: "Actively sourcing",
  screening: "Screening candidates",
  interviewing: "Interviewing",
  offer: "Offer out",
  hired: "Hired / filled",
  on_hold: "On hold",
  closed: "Closed",
};

/** Stages where the public can still submit applications / referrals. */
export const ROLE_STATUS_ACCEPTING_SUBMISSIONS: RoleStatus[] = [
  "getting_started",
  "sourcing",
  "screening",
  "interviewing",
];

export function isRoleStatus(s: string): s is RoleStatus {
  return (ROLE_STATUSES as readonly string[]).includes(s);
}

export function roleAcceptsSubmissions(status: string): boolean {
  return isRoleStatus(status) && ROLE_STATUS_ACCEPTING_SUBMISSIONS.includes(status);
}

export function roleStatusLabel(status: string): string {
  if (isRoleStatus(status)) return ROLE_STATUS_LABELS[status];
  return status;
}
