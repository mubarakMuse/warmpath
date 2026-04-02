/** Normalize stored referral-bonus copy: default USD with a leading $ when user types a bare number. */
export function normalizeReferralBonusForStorage(raw: string, maxLen: number): string | null {
  const t = raw.trim().slice(0, maxLen);
  if (!t) return null;
  if (/^[\$€£]/.test(t)) return t;
  if (/^\d/.test(t)) return `$${t}`;
  return t;
}
