/** For middleware: returns null if unset (caller redirects to login). */
export function getWarmpathJwtSecretBytes(): Uint8Array | null {
  const raw = process.env.WARMPATH_SESSION_SECRET;
  if (!raw || raw.length < 16) return null;
  return new TextEncoder().encode(raw);
}

/** For server actions: throws if misconfigured. */
export function requireWarmpathJwtSecretBytes(): Uint8Array {
  const b = getWarmpathJwtSecretBytes();
  if (!b) {
    throw new Error("Set WARMPATH_SESSION_SECRET (at least 16 characters) in .env.local");
  }
  return b;
}
