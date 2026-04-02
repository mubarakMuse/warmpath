"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileIdFromSession } from "@/lib/session/profile";

export type ProfileSettingsState = { ok?: boolean; error?: string };

type HirerDisplay = {
  hirer_full_name: string;
  hirer_linkedin_url: string | null;
  hirer_avatar_url: string | null;
  company_name: string | null;
  company_website: string | null;
  company_linkedin_url: string | null;
  company_logo_url: string | null;
};

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

function normalizeUrl(s: string) {
  const t = s.trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

export async function syncRolesHirerDisplay(
  admin: SupabaseClient,
  hirerId: string,
  row: HirerDisplay,
) {
  await admin.from("roles").update(row).eq("hirer_id", hirerId);
}

export async function updateHirerProfile(
  _prev: ProfileSettingsState,
  formData: FormData,
): Promise<ProfileSettingsState> {
  const hirerId = await getProfileIdFromSession();
  if (!hirerId) redirect("/hire/sign-up");

  const fullName = clip(String(formData.get("full_name") ?? ""), 200);
  if (fullName.length < 2) return { error: "Enter your name." };

  const linkedin_url = normalizeUrl(String(formData.get("linkedin_url") ?? "")) ?? null;
  const avatar_url = normalizeUrl(String(formData.get("avatar_url") ?? "")) ?? null;
  const company_name = clip(String(formData.get("company_name") ?? ""), 200) || null;
  const company_website = normalizeUrl(String(formData.get("company_website") ?? "")) ?? null;
  const company_linkedin_url =
    normalizeUrl(String(formData.get("company_linkedin_url") ?? "")) ?? null;
  const company_logo_url = normalizeUrl(String(formData.get("company_logo_url") ?? "")) ?? null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      linkedin_url,
      avatar_url,
      company_name,
      company_website,
      company_linkedin_url,
      company_logo_url,
    })
    .eq("id", hirerId);

  if (error) return { error: error.message };

  await syncRolesHirerDisplay(admin, hirerId, {
    hirer_full_name: fullName,
    hirer_linkedin_url: linkedin_url,
    hirer_avatar_url: avatar_url,
    company_name,
    company_website,
    company_linkedin_url,
    company_logo_url,
  });

  return { ok: true };
}
