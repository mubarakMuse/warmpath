import Link from "next/link";
import { redirect } from "next/navigation";
import { CompanyLoginForm } from "@/app/company/login/company-login-form";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";

export const metadata = { title: "Company portal" };

export default async function CompanyLoginPage() {
  if (await getCompanyIdFromServerSession()) redirect("/company/dashboard");

  return (
    <div className="min-h-dvh bg-[#faf8f5] px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <Link href="/" className="text-sm font-medium text-amber-800 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-8 font-serif text-2xl font-semibold text-stone-900">Company portal</h1>
        <p className="mt-2 text-sm text-stone-600">
          Enter the access code your admin shared. You can edit company details and roles here.
        </p>
        <CompanyLoginForm />
      </div>
    </div>
  );
}
