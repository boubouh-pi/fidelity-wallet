"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { signInAction, type SignInState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function LoginForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAction, { error: "", email: "" });

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          defaultValue={state.email}
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
