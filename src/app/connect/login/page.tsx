import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectLoginForm } from "@/app/connect/login/connect-login-form";
import { getConnectorIdFromServerSession } from "@/lib/session/connector-session";

export const metadata = { title: "Connector portal" };

export default async function ConnectLoginPage() {
  if (await getConnectorIdFromServerSession()) redirect("/connect/dashboard");

  return (
    <div className="min-h-dvh bg-[#faf8f5] px-6 py-16">
      <div className="mx-auto max-w-md text-center">
        <Link href="/" className="text-sm font-medium text-amber-800 hover:underline">
          ← Home
        </Link>
        <h1 className="mt-8 font-serif text-2xl font-semibold text-stone-900">Connector portal</h1>
        <p className="mt-2 text-sm text-stone-600">
          For PMs, EMs, and others who know strong people: sign in with your code, then refer candidates to open
          roles with a LinkedIn link and a short note on why they fit.
        </p>
        <ConnectLoginForm />
      </div>
    </div>
  );
}
