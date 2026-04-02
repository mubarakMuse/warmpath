"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRoleStatus } from "@/lib/role-status";
import { getProfileIdFromSession } from "@/lib/session/profile";

export type RoleStatusState = { error?: string };

export async function updateRoleStatus(_prev: RoleStatusState, formData: FormData) {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  const roleId = String(formData.get("role_id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!roleId || !isRoleStatus(status)) {
    return { error: "Invalid update." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const { data: roleRow, error: fetchErr } = await admin
    .from("roles")
    .select("hirer_id")
    .eq("id", roleId)
    .maybeSingle();

  if (fetchErr || !roleRow) return { error: "Role not found." };

  const adminSess = await getAdminSessionProfile();
  const isAdmin = !!adminSess;

  if (!isAdmin && roleRow.hirer_id !== profileId) {
    return { error: "Not allowed." };
  }

  if (status !== "draft" && !roleRow.hirer_id) {
    return {
      error:
        "Assign a hiring manager in Admin before publishing. This role is still unassigned.",
    };
  }

  const { error } = await admin.from("roles").update({ status }).eq("id", roleId);

  if (error) return { error: error.message };

  revalidatePath("/hire/dashboard");
  revalidatePath(`/hire/roles/${roleId}`);
  if (slug) revalidatePath(`/r/${slug}`);

  return {};
}
