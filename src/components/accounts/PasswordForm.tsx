"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/account-actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SettingsSection } from "@/components/settings/SettingsSection";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

/** "Your account" section: who is signed in, and a password change form. */
export function PasswordForm({ name, email }: { name: string; email: string }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("newPassword") ?? "");
    if (next !== String(data.get("confirmPassword") ?? "")) {
      setMessage("");
      setError("The new passwords do not match.");
      return;
    }
    startTransition(async () => {
      const result = await changePasswordAction(String(data.get("currentPassword") ?? ""), next);
      if (!result.ok) {
        setMessage("");
        setError(result.error);
        return;
      }
      form.reset();
      setError("");
      setMessage("Password changed. Other devices have been signed out.");
    });
  }

  return (
    <SettingsSection title="Your account" description={`Signed in as ${name} (${email}).`}>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Current password
            <input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            New password
            <input name="newPassword" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
            <span className="mt-1 block text-xs font-normal text-slate-400">At least 10 characters.</span>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Confirm new password
            <input name="confirmPassword" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
          </label>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:col-span-2">
            <p role="status" aria-live="polite" className={error ? "text-sm font-medium text-red-600" : "text-sm font-medium text-emerald-700"}>
              {error || message}
            </p>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving..." : "Change password"}
            </Button>
          </div>
        </form>
      </Card>
    </SettingsSection>
  );
}
