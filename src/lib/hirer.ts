/** First word of full name for “Help Jordan hire” style headings. */
export function hirerFirstName(full: string | null | undefined) {
  const n = full?.trim().split(/\s+/)[0];
  return n || null;
}

export function helpHireHeading(full: string | null | undefined) {
  const n = hirerFirstName(full);
  return n ? `Help ${n} hire` : "Help this team hire";
}
