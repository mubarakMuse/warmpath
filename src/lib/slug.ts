export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "company";

}

export function makeCompanySlug(name: string) {
  return slugify(name);
}

export function makeRoleSlug(title: string) {
  return slugify(title);
}
