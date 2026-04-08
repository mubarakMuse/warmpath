"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type CompanyInterestState =
  | { ok?: false; error?: string }
  | { ok: true; companyName: string; email: string };

function sanitizeCompanyName(raw: string): string | null {
  const name = raw.trim().replace(/[\r\n\t]+/g, " ");
  if (name.length < 2) return null;
  if (name.length > 120) return null;
  return name;
}

function sanitizeEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length < 5) return null;
  if (email.length > 320) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

/**
 * Inserts into public.waitlist (kind = company_interest).
 * Reuse the same table later for connectors with kind = 'connector' (+ email, etc.).
 */
export async function saveCompanyInterest(
  _prev: CompanyInterestState,
  formData: FormData,
): Promise<CompanyInterestState> {
  const companyName = sanitizeCompanyName(String(formData.get("company_name") ?? ""));
  if (!companyName) {
    return { error: "Enter your company name (at least 2 characters)." };
  }

  const email = sanitizeEmail(String(formData.get("email") ?? ""));
  if (!email) {
    return { error: "Enter a valid work email." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      error: "Server is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    };
  }

  const { error } = await admin.from("waitlist").insert({
    kind: "company_interest",
    company_name: companyName,
    email,
  });

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return {
        error:
          "Waitlist table missing. Run supabase/migrations/002_waitlist.sql in the Supabase SQL editor.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { ok: true, companyName, email };
}
