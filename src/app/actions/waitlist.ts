"use server";

import { createClient } from "@/lib/supabase/server";

export type WaitlistState = {
  ok?: boolean;
  error?: string;
};

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const referrer = String(formData.get("referrer") ?? "")
    .trim()
    .slice(0, 200);

  if (!email || !isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error:
        "Supabase is not configured. Copy .env.example to .env.local and add your project keys.",
    };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Supabase client could not be created. Check your environment variables." };
  }

  const { error } = await supabase.from("waitlist").insert({
    email,
    referrer: referrer || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    return { error: error.message };
  }

  return { ok: true };
}
