/** Returns a usable href, or null if empty. Prefixes https:// when missing. */
export function ensureHttpsUrl(raw: string | null | undefined): string | null {
  const t = raw?.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
