/** Stored in `connector_referrals.relationship_type`; use `relationship_other` when `other`. */
export const RELATIONSHIP_OPTIONS = [
  { value: "", label: "Skip" },
  { value: "colleague", label: "Current or former colleague" },
  { value: "friend", label: "Friend" },
  { value: "former_coworker", label: "Former coworker" },
  { value: "worked_together", label: "Worked together on a project" },
  { value: "school", label: "School or alumni network" },
  { value: "met_at_event", label: "Met at an event" },
  { value: "linkedin", label: "Connected on LinkedIn" },
  { value: "other", label: "Other" },
] as const;

const ALLOWED = new Set<string>(RELATIONSHIP_OPTIONS.map((o) => o.value).filter(Boolean));

export function isAllowedRelationshipType(v: string): boolean {
  return ALLOWED.has(v);
}

export function relationshipDisplay(type: string | null | undefined, other: string | null | undefined): string | null {
  if (!type) return other?.trim() ? other.trim() : null;
  if (type === "other") return other?.trim() ? `Other: ${other.trim()}` : "Other";
  const row = RELATIONSHIP_OPTIONS.find((o) => o.value === type);
  return row?.label ?? type;
}
