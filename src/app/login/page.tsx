import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Wallet } from "lucide-react";
import { getCurrentUser, homePath } from "@/auth/dal";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Fidelity Wallet" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Wallet size={22} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Sign in to Fidelity Wallet</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your restaurant&apos;s loyalty program.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Accounts are created by the Fidelity Wallet team. Contact us if you need access.
        </p>
      </div>
    </main>
  );
}

/** Someone already signed in goes straight to their dashboard. */
async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect(homePath(user));
  return null;
}
