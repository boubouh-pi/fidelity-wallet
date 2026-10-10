"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { createAccountAction, deleteAccountAction } from "@/app/admin/users/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, initials } from "@/lib/utils";
import type { AccountSummary } from "@/services/accounts";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function AccountManager({
  initialAccounts,
  restaurants,
  currentUserId,
}: {
  initialAccounts: AccountSummary[];
  restaurants: { id: string; name: string }[];
  currentUserId: string;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [formOpen, setFormOpen] = useState(false);
  const [role, setRole] = useState<"restaurant" | "admin">("restaurant");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ email: string; temporaryPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createAccountAction({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        role,
        restaurantId: role === "restaurant" ? String(data.get("restaurantId") ?? "") : null,
      });
      if (!result.ok) return setError(result.error);
      setAccounts(result.accounts);
      setCreated(result.value);
      setCopied(false);
      setError("");
      setFormOpen(false);
      form.reset();
    });
  }

  function onDelete(account: AccountSummary) {
    if (!window.confirm(`Remove ${account.name}'s access? They will be signed out immediately.`)) return;
    startTransition(async () => {
      const result = await deleteAccountAction(account.id);
      if (!result.ok) return setError(result.error);
      setAccounts(result.accounts);
      setError("");
    });
  }

  async function copyPassword() {
    if (!created) return;
    await navigator.clipboard.writeText(created.temporaryPassword);
    setCopied(true);
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        {!formOpen && (
          <Button variant="primary" onClick={() => { setFormOpen(true); setCreated(null); }}>
            <Plus size={16} />
            New account
          </Button>
        )}
      </div>

      {created && (
        <div role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-900">Account created for {created.email}</p>
          <p className="mt-1 text-sm text-emerald-800">
            Share this temporary password with them securely. It will not be shown again; they can change it in Settings.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-slate-900">
              {created.temporaryPassword}
            </code>
            <Button size="sm" onClick={copyPassword}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" onClick={() => setCreated(null)}>Done</Button>
          </div>
        </div>
      )}

      {formOpen && (
        <Card className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">New account</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => { setFormOpen(false); setError(""); }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={onCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Name
              <input name="name" required maxLength={80} placeholder="e.g. Marcel Dupont" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Email
              <input name="email" type="email" required placeholder="name@restaurant.com" className={inputClass} />
            </label>
            <fieldset className="text-sm font-medium text-slate-700 sm:col-span-2">
              <legend>Account type</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["restaurant", "admin"] as const).map((r) => (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${role === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"}`}
                  >
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                    {r === "restaurant" ? "Restaurant team" : "Fidelity Wallet admin"}
                  </label>
                ))}
              </div>
            </fieldset>
            {role === "restaurant" ? (
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Restaurant
                <select name="restaurantId" required defaultValue="" className={inputClass}>
                  <option value="" disabled>Choose a restaurant</option>
                  {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:col-span-2">
                Admins can open every restaurant and manage all accounts.
              </p>
            )}
            {error && <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button onClick={() => { setFormOpen(false); setError(""); }}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Creating..." : "Create account"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!formOpen && error && <p role="alert" className="mb-4 text-sm font-medium text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Access</th>
                <th scope="col" className="px-4 py-3 font-medium">Created</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((a) => (
                <tr key={a.id} className="align-middle">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                        {initials(a.name)}
                      </span>
                      <span className="min-w-0">
                        {a.name} {a.id === currentUserId && <span className="text-xs font-normal text-slate-400">(you)</span>}
                        <span className="block truncate text-xs font-normal text-slate-500">{a.email}</span>
                      </span>
                    </span>
                  </th>
                  <td className="px-4 py-3">
                    {a.role === "admin" ? <Badge tone="brand">Fidelity Wallet admin</Badge> : <Badge tone="neutral">{a.restaurantName}</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {a.id !== currentUserId && (
                      <Button size="sm" disabled={pending} onClick={() => onDelete(a)}>Remove</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <p className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
            <KeyRound size={16} /> No accounts yet.
          </p>
        )}
      </div>
    </>
  );
}
