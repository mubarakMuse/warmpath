"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clearConnectorSessionCookie,
  getConnectorIdFromServerSession,
  setConnectorSessionCookie,
  signConnectorSessionToken,
} from "@/lib/session/connector-session";
import { isAllowedRelationshipType } from "@/lib/relationship-options";

export type ConnectFormState = { error?: string; ok?: boolean; message?: string };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

function optionalEmail(raw: string): string | null {
  const t = clip(raw, 320);
  if (!t) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return null;
  return t;
}

function normalizeLinkedInUrl(raw: string): string | null {
  const t = raw.trim();
  if (t.length < 8) return null;
  const withProto = t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.toLowerCase().includes("linkedin.com")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function connectorCodeLogin(_prev: ConnectFormState, formData: FormData): Promise<ConnectFormState> {
  const code = String(formData.get("access_code") ?? "")
    .trim()
    .toUpperCase();
  if (code.length < 4) return { error: "Enter your connector access code." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data, error } = await admin.from("connectors").select("id").eq("access_code", code).maybeSingle();
  if (error) return { error: error.message };
  if (!data?.id) return { error: "That code doesn’t match any connector." };

  let token: string;
  try {
    token = await signConnectorSessionToken(data.id as string);
  } catch {
    return { error: "Set WARMPATH_SESSION_SECRET (16+ chars) in .env.local." };
  }

  await setConnectorSessionCookie(token);
  redirect("/connect/dashboard");
}

export async function connectorLogout() {
  await clearConnectorSessionCookie();
  redirect("/connect/login");
}

export async function connectorUpdateProfile(
  _prev: ConnectFormState,
  formData: FormData,
): Promise<ConnectFormState> {
  const connectorId = await getConnectorIdFromServerSession();
  if (!connectorId) return { error: "Not signed in." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (full_name.length < 2) return { error: "Name is required." };

  const role_title = clip(String(formData.get("role_title") ?? ""), 120) || null;
  const email_raw = String(formData.get("email") ?? "");
  const email = optionalEmail(email_raw);
  if (email_raw.trim() && !email) {
    return { error: "Use a valid email or leave it blank." };
  }

  const li_raw = String(formData.get("linkedin_url") ?? "").trim();
  const linkedin_url = li_raw ? normalizeLinkedInUrl(li_raw) : null;
  if (li_raw && !linkedin_url) {
    return { error: "Use a LinkedIn profile URL (linkedin.com/…)." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { error } = await admin
    .from("connectors")
    .update({ full_name, role_title, email, linkedin_url })
    .eq("id", connectorId);

  if (error) return { error: error.message };

  revalidatePath("/connect/dashboard");
  revalidatePath("/connect/roles");
  revalidatePath("/company/dashboard");
  revalidatePath("/admin");
  return { ok: true, message: "Profile saved." };
}

export async function connectorSubmitReferral(
  _prev: ConnectFormState,
  formData: FormData,
): Promise<ConnectFormState> {
  const connectorId = await getConnectorIdFromServerSession();
  if (!connectorId) return { error: "Not signed in." };

  const roleId = String(formData.get("role_id") ?? "").trim();
  const candidateUrl = normalizeLinkedInUrl(String(formData.get("candidate_linkedin_url") ?? ""));
  const fit = clip(String(formData.get("fit_description") ?? ""), 4000);
  const candidate_name = clip(String(formData.get("candidate_name") ?? ""), 200) || null;
  const candidate_email_raw = String(formData.get("candidate_email") ?? "");
  const candidate_email = optionalEmail(candidate_email_raw);
  if (candidate_email_raw.trim() && !candidate_email) {
    return { error: "If you add an email, use a valid address." };
  }

  const relTypeRaw = String(formData.get("relationship_type") ?? "").trim();
  const relationship_type =
    relTypeRaw && isAllowedRelationshipType(relTypeRaw) ? relTypeRaw : null;
  const relationship_other = clip(String(formData.get("relationship_other") ?? ""), 500) || null;
  if (relationship_type === "other" && (!relationship_other || relationship_other.length < 2)) {
    return { error: "Please describe how you know them when you choose “Other”." };
  }

  if (!roleId) return { error: "Choose a role." };
  if (!candidateUrl) return { error: "Enter a valid LinkedIn profile URL (linkedin.com/…)." };
  if (fit.length < 20) return { error: "Add a short description of why they fit (at least 20 characters)." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data: role, error: rErr } = await admin
    .from("roles")
    .select("id, status, slug")
    .eq("id", roleId)
    .maybeSingle();

  if (rErr || !role) return { error: "Role not found." };
  if (role.status !== "active") {
    return { error: "That role is not accepting referrals right now (must be active)." };
  }

  const { error } = await admin.from("connector_referrals").insert({
    connector_id: connectorId,
    role_id: roleId,
    candidate_linkedin_url: candidateUrl,
    fit_description: fit,
    candidate_name,
    candidate_email,
    relationship_type,
    relationship_other: relationship_type === "other" ? relationship_other : null,
  });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return { error: "Referrals table missing. Run migration 003_connectors_referrals.sql." };
    }
    return { error: error.message };
  }

  revalidatePath("/connect/dashboard");
  revalidatePath("/connect/roles");
  revalidatePath(`/connect/roles/${role.slug as string}`);
  revalidatePath(`/r/${role.slug as string}`);
  revalidatePath("/company/dashboard");
  return { ok: true, message: "Referral submitted. Thank you." };
}
