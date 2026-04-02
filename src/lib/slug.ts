import { customAlphabet } from "nanoid";

const suffix = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export function slugifyTitle(title: string) {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "role";
}

export function makeRoleSlug(title: string) {
  return `${slugifyTitle(title)}-${suffix()}`;
}

/** URL-safe company slug (no random suffix; must be unique in DB). */
export function makeCompanySlug(name: string) {
  const base = slugifyTitle(name);
  return base || "company";
}
