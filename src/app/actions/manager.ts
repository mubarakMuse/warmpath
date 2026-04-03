"use server";

import { customAlphabet } from "nanoid";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  clearProfileSessionCookie,
  setProfileSessionCookie,
  signProfileSession,
} from "@/lib/session/profile";

/** Short code for hiring login (MVP). Linked to profiles.access_code until you add Google Auth. */
const makeAccessCode = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

export type RegisterState =
  | { ok?: false; error?: string }
  | { ok: true; accessCode: string };

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function registerManager(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (name.length < 2) return { error: "Enter your name (at least 2 characters)." };
  if (!isValidEmail(email)) return { error: "Enter a valid email." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const accessCode = makeAccessCode();
  const { error } = await admin.from("profiles").insert({
    full_name: name,
    email,
    access_code: accessCode,
    account_role: "hirer",
    auth_user_id: null,
  });

  if (error) return { error: error.message };

  return { ok: true, accessCode };
}

export async function loginManager(_prev: { error?: string } | undefined, formData: FormData) {
  const code = String(formData.get("access_code") ?? "").trim().toUpperCase();
  if (code.length < 6) return { error: "Enter the access code you saved at signup." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const { data, error } = await admin.from("profiles").select("id").eq("access_code", code).maybeSingle();

  if (error) return { error: error.message };
  if (!data?.id) return { error: "That code doesn’t match any account. Check for typos." };

  let token: string;
  try {
    token = await signProfileSession(data.id);
  } catch {
    return { error: "Session signing failed. Set WARMPATH_SESSION_SECRET in .env.local." };
  }

  await setProfileSessionCookie(token);
  redirect("/hire/dashboard");
}

export async function logoutManager() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    /* Supabase env missing or sign-out optional */
  }
  await clearProfileSessionCookie();
  redirect("/login");
}
