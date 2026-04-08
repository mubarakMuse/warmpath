"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customAlphabet } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeCompanySlug, makeRoleSlug } from "@/lib/slug";
import {
  clearAdminSessionCookie,
  isAdminServerSession,
  setAdminSessionCookie,
  signAdminSessionToken,
} from "@/lib/session/admin-session";

const makeAccessCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

export type FormState = { error?: string; ok?: boolean; message?: string };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

function verifyAdminPassword(input: string, expected: string | undefined): boolean {
  if (!expected || input.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(input, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export async function adminPasswordLogin(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.WARMPATH_ADMIN_PASSWORD;
  if (!expected) {
    return { error: "Admin password is not configured (set WARMPATH_ADMIN_PASSWORD)." };
  }
  if (!verifyAdminPassword(password, expected)) {
    return { error: "Invalid password." };
  }

  let token: string;
  try {
    token = await signAdminSessionToken();
  } catch {
    return { error: "Set WARMPATH_SESSION_SECRET (16+ chars) in .env.local." };
  }

  await setAdminSessionCookie(token);
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function adminCreateCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdminServerSession())) return { error: "Unauthorized." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Company name is required." };

  let slug = String(formData.get("slug") ?? "").trim() || makeCompanySlug(name);
  const logo_url = clip(String(formData.get("logo_url") ?? ""), 500) || null;
  const linkedin_url = clip(String(formData.get("linkedin_url") ?? ""), 500) || null;
  const website = clip(String(formData.get("website") ?? ""), 500) || null;
  const description = clip(String(formData.get("description") ?? ""), 2000) || null;
  const access_code = makeAccessCode();

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  for (let i = 0; i < 8; i++) {
    const { error } = await admin.from("companies").insert({
      name,
      slug,
      logo_url,
      linkedin_url,
      website,
      description,
      access_code,
    });
    if (!error) {
      revalidatePath("/admin");
      return {
        ok: true,
        message: `Created ${name}. Company access code: ${access_code} (share for /company/login).`,
      };
    }
    if (error.code === "23505") {
      slug = `${makeCompanySlug(name)}-${i + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not create company (slug conflict)." };
}

export async function adminCreateRole(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdminServerSession())) return { error: "Unauthorized." };

  const company_id = String(formData.get("company_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!company_id) return { error: "Pick a company." };
  if (title.length < 2) return { error: "Role title is required." };

  const description = clip(String(formData.get("description") ?? ""), 8000) || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const referral_bonus = clip(String(formData.get("referral_bonus") ?? ""), 2000) || null;
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const status =
    statusRaw === "active" || statusRaw === "closed" || statusRaw === "draft" ? statusRaw : "draft";

  let slug = makeRoleSlug(title);

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data: co } = await admin.from("companies").select("id").eq("id", company_id).maybeSingle();
  if (!co) return { error: "Company not found." };

  for (let i = 0; i < 8; i++) {
    const { error } = await admin.from("roles").insert({
      company_id,
      title,
      slug,
      description,
      location,
      status,
      referral_bonus,
    });
    if (!error) {
      revalidatePath("/admin");
      revalidatePath("/connect/dashboard");
      revalidatePath("/connect/roles");
      revalidatePath(`/r/${slug}`);
      return { ok: true, message: `Role created (${slug}).` };
    }
    if (error.code === "23505") {
      slug = `${makeRoleSlug(title)}-${i + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not create role (slug conflict)." };
}

export async function adminCreateConnector(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdminServerSession())) return { error: "Unauthorized." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (full_name.length < 2) return { error: "Full name is required." };

  const role_title = clip(String(formData.get("role_title") ?? ""), 120) || null;
  const email = clip(String(formData.get("email") ?? ""), 320) || null;
  const linkedin_url = clip(String(formData.get("linkedin_url") ?? ""), 500) || null;
  const access_code = makeAccessCode();

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { error } = await admin.from("connectors").insert({
    full_name,
    role_title,
    email,
    linkedin_url,
    access_code,
  });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return {
        error: "Run supabase/migrations/003_connectors_referrals.sql in Supabase.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  return {
    ok: true,
    message: `Connector created. Access code: ${access_code} — share for /connect/login`,
  };
}

export async function adminUpdateConnector(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdminServerSession())) return { error: "Unauthorized." };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing connector." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (full_name.length < 2) return { error: "Full name is required." };

  const role_title = clip(String(formData.get("role_title") ?? ""), 120) || null;
  const email = clip(String(formData.get("email") ?? ""), 320) || null;
  const linkedin_url = clip(String(formData.get("linkedin_url") ?? ""), 500) || null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { error } = await admin
    .from("connectors")
    .update({ full_name, role_title, email, linkedin_url })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/connect/dashboard");
  revalidatePath("/connect/roles");
  revalidatePath("/company/dashboard");
  return { ok: true, message: "Connector updated." };
}

export async function adminUpdateCompany(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdminServerSession())) return { error: "Unauthorized." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Missing company." };
  if (name.length < 2) return { error: "Company name is required." };

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { error: "Slug is required." };

  const base = {
    name,
    logo_url: clip(String(formData.get("logo_url") ?? ""), 500) || null,
    linkedin_url: clip(String(formData.get("linkedin_url") ?? ""), 500) || null,
    website: clip(String(formData.get("website") ?? ""), 500) || null,
    description: clip(String(formData.get("description") ?? ""), 2000) || null,
  };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  let currentSlug = slug;
  for (let i = 0; i < 8; i++) {
    const { error } = await admin.from("companies").update({ ...base, slug: currentSlug }).eq("id", id);
    if (!error) {
      revalidatePath("/admin");
      return { ok: true, message: "Company updated." };
    }
    if (error.code === "23505") {
      currentSlug = `${makeCompanySlug(name)}-${i + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Slug conflict." };
}

export async function adminUpdateRole(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdminServerSession())) return { error: "Unauthorized." };

  const roleId = String(formData.get("role_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!roleId) return { error: "Missing role." };
  if (title.length < 2) return { error: "Title is required." };

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { error: "Slug is required." };

  const description = clip(String(formData.get("description") ?? ""), 8000) || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const referral_bonus = clip(String(formData.get("referral_bonus") ?? ""), 2000) || null;
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const status =
    statusRaw === "active" || statusRaw === "closed" || statusRaw === "draft" ? statusRaw : "draft";

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data: prev } = await admin.from("roles").select("slug").eq("id", roleId).maybeSingle();
  const prevSlug = (prev?.slug as string | undefined) ?? slug;

  let currentSlug = slug;
  for (let i = 0; i < 8; i++) {
    const { error } = await admin
      .from("roles")
      .update({
        title,
        slug: currentSlug,
        description,
        location,
        status,
        referral_bonus,
      })
      .eq("id", roleId);

    if (!error) {
      revalidatePath("/admin");
      revalidatePath("/connect/dashboard");
      revalidatePath("/connect/roles");
      revalidatePath(`/r/${prevSlug}`);
      if (currentSlug !== prevSlug) revalidatePath(`/r/${currentSlug}`);
      return { ok: true, message: "Role updated." };
    }
    if (error.code === "23505") {
      currentSlug = `${makeRoleSlug(title)}-${i + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Slug conflict." };
}

