/** Stored in `connector_referrals.referral_stage`. */
export const REFERRAL_STAGES = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "Offer extended" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
] as const;

export type ReferralStage = (typeof REFERRAL_STAGES)[number]["value"];

const STAGE_SET = new Set<string>(REFERRAL_STAGES.map((s) => s.value));

export function isValidReferralStage(v: string): v is ReferralStage {
  return STAGE_SET.has(v);
}

export function referralStageLabel(stage: string | null | undefined): string {
  if (!stage) return "New";
  const row = REFERRAL_STAGES.find((s) => s.value === stage);
  return row?.label ?? stage;
}

/** Stored in `company_reason_preset` when not using free text only. */
export const REASON_PRESETS = [
  { value: "", label: "— None / notes only —" },
  { value: "not_enough_experience", label: "Not enough experience" },
  { value: "role_filled", label: "Role filled" },
  { value: "location_policy", label: "Location or work policy" },
  { value: "skills_mismatch", label: "Skills mismatch" },
  { value: "timeline", label: "Timeline" },
  { value: "stronger_candidates", label: "Stronger candidates in process" },
  { value: "other", label: "Other (see notes)" },
] as const;

const PRESET_SET: Set<string> = new Set(
  REASON_PRESETS.flatMap((p) => (p.value ? [p.value] : [])),
);

export function isValidReasonPreset(v: string): boolean {
  return v === "" || PRESET_SET.has(v);
}

export function reasonPresetLabel(key: string | null | undefined): string | null {
  if (!key) return null;
  const row = REASON_PRESETS.find((p) => p.value === key);
  return row?.label ?? key;
}
