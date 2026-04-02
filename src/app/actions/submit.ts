"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileIdFromSession } from "@/lib/session/profile";

export type SubmitState = { ok?: boolean; error?: string };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

export async function submitApplication(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const profileId = await getProfileIdFromSession();
  if (!profileId) {
    return { error: "Sign in with Google or email link to apply or refer." };
  }

  const roleId = String(formData.get("role_id") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim();

  if (!roleId) return { error: "Missing role." };
  if (kind !== "self" && kind !== "referral") return { error: "Pick how you’re responding." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  const { data: profile, error: profErr } = await admin
    .from("profiles")
    .select("email")
    .eq("id", profileId)
    .maybeSingle();

  if (profErr || !profile?.email) {
    return { error: "Could not load your account." };
  }

  const submitterEmail = profile.email.trim().toLowerCase();

  const { data: roleRow } = await admin
    .from("roles")
    .select("hirer_id")
    .eq("id", roleId)
    .maybeSingle();

  if (roleRow?.hirer_id && roleRow.hirer_id === profileId) {
    return { error: "Use your hiring dashboard for this role—you can’t refer yourself here." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { error: "Application form is not configured (Supabase keys missing)." };
  }

  const { createClient } = await import("@/lib/supabase/server");
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Could not connect. Try again later." };
  }

  if (kind === "self") {
    const submitterName = clip(String(formData.get("submitter_name") ?? ""), 200);
    const selfLinkedin = clip(String(formData.get("self_linkedin_url") ?? ""), 500);
    const selfPitch = clip(String(formData.get("self_pitch") ?? ""), 4000);
    if (submitterName.length < 2) return { error: "Enter your name." };

    const { error } = await supabase.from("submissions").insert({
      role_id: roleId,
      kind: "self",
      submitter_email: submitterEmail,
      submitter_name: submitterName,
      self_linkedin_url: selfLinkedin || null,
      self_pitch: selfPitch || null,
    });

    if (error) {
      if (error.code === "42501" || error.message.includes("policy")) {
        return { error: "This role is no longer accepting responses." };
      }
      return { error: error.message };
    }
  } else {
    const candidateName = clip(String(formData.get("candidate_name") ?? ""), 200);
    const candidateEmailRaw = String(formData.get("candidate_email") ?? "").trim().toLowerCase();
    const candidateEmail =
      candidateEmailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmailRaw)
        ? candidateEmailRaw
        : null;
    const whyFit = clip(String(formData.get("why_fit") ?? ""), 4000);
    const relationship = clip(String(formData.get("relationship") ?? ""), 500);
    const candidateLinkedin = clip(String(formData.get("candidate_linkedin_url") ?? ""), 500);
    if (candidateName.length < 2) return { error: "Enter the person you’re referring." };
    if (whyFit.length < 10) return { error: "Add a short note on why they’re a strong fit." };
    if (relationship.length < 2) return { error: "Describe how you know them." };

    const { error } = await supabase.from("submissions").insert({
      role_id: roleId,
      kind: "referral",
      submitter_email: submitterEmail,
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      why_fit: whyFit,
      relationship: relationship,
      candidate_linkedin_url: candidateLinkedin || null,
    });

    if (error) {
      if (error.code === "42501" || error.message.includes("policy")) {
        return { error: "This role is no longer accepting responses." };
      }
      return { error: error.message };
    }
  }

  return { ok: true };
}
