"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileIdFromSession } from "@/lib/session/profile";

export type ProfileSettingsState = { ok?: boolean; error?: string };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

function normalizeUrl(s: string) {
  const t = s.trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
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
    })
    .eq("id", hirerId);

  if (error) return { error: error.message };

  return { ok: true };
}
