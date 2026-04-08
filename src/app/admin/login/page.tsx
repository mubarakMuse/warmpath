import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login/admin-login-form";
import { isAdminServerSession } from "@/lib/session/admin-session";

export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage() {
  if (await isAdminServerSession()) redirect("/admin");

  return (
    <div className="min-h-dvh bg-stone-100 px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <Link href="/" className="text-sm font-medium text-amber-800 hover:underline">
          ← Home
        </Link>
        <div className="mt-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/warmpath-mark.svg"
            alt=""
            width={56}
            height={56}
            className="rounded-2xl shadow-md"
          />
        </div>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-stone-900">Admin</h1>
        <p className="mt-2 text-sm text-stone-600">Sign in with the password configured for this environment.</p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
