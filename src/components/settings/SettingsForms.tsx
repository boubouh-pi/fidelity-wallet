"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { updateLoyaltySettings, updateProfile } from "@/app/r/[restaurantId]/settings/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { EditableProgramField, LoyaltyProgram, RestaurantProfile } from "@/types";
import { SettingsSection } from "./SettingsSection";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

/** Save bar shared by both forms: feedback on the left, save button on the right. */
function FormFooter({ dirty, pending, error, saved }: { dirty: boolean; pending: boolean; error: string; saved: string }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p role="status" aria-live="polite" className={error ? "text-sm font-medium text-red-600" : "text-sm font-medium text-emerald-700"}>
        {error || saved}
      </p>
      <Button type="submit" variant="primary" disabled={!dirty || pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}

export function ProfileForm({ restaurantId, initialProfile }: { restaurantId: string; initialProfile: RestaurantProfile }) {
  const [saved, setSaved] = useState(initialProfile);
  const [values, setValues] = useState(initialProfile);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const fields = ["contactEmail", "phone", "address", "website"] as const;
  const dirty = fields.some((f) => values[f] !== saved[f]);
  const set = (field: (typeof fields)[number]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [field]: e.target.value });
    setMessage("");
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfile(restaurantId, values);
      if (!result.ok) return setError(result.error);
      setSaved(result.value);
      setValues(result.value);
      setError("");
      setMessage("Profile saved.");
    });
  }

  return (
    <SettingsSection title="Restaurant profile" description="How Fidelity Wallet and your customers can reach you.">
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Contact email
            <input type="email" required value={values.contactEmail} onChange={set("contactEmail")} className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone <span className="font-normal text-slate-400">(optional)</span>
            <input type="tel" value={values.phone} onChange={set("phone")} placeholder="(613) 555-0100" className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Address <span className="font-normal text-slate-400">(optional)</span>
            <input value={values.address} onChange={set("address")} maxLength={120} placeholder="Street, city, province" className={inputClass} />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Website <span className="font-normal text-slate-400">(optional)</span>
            <input type="url" value={values.website} onChange={set("website")} placeholder="https://" className={inputClass} />
          </label>
          <div className="sm:col-span-2">
            <FormFooter dirty={dirty} pending={pending} error={error} saved={message} />
          </div>
        </form>
      </Card>
    </SettingsSection>
  );
}

/** A program value the restaurant cannot change. */
function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-1 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        <span className="truncate">{value}</span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
          <Lock size={12} />
          Managed by Fidelity Wallet
        </span>
      </p>
    </div>
  );
}

export function LoyaltySettingsForm({
  restaurantId,
  initialProgram,
  editable,
}: {
  restaurantId: string;
  initialProgram: LoyaltyProgram;
  editable: EditableProgramField[];
}) {
  const [saved, setSaved] = useState(initialProgram);
  const [description, setDescription] = useState(initialProgram.rewardDescription);
  const [validity, setValidity] = useState(String(initialProgram.expiresInDays));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const canEdit = (field: EditableProgramField) => editable.includes(field);
  const changes: Partial<{ rewardDescription: string; expiresInDays: number }> = {};
  if (canEdit("rewardDescription") && description !== saved.rewardDescription) changes.rewardDescription = description;
  if (canEdit("expiresInDays") && Number(validity) !== saved.expiresInDays) changes.expiresInDays = Number(validity);
  const dirty = Object.keys(changes).length > 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateLoyaltySettings(restaurantId, changes);
      if (!result.ok) return setError(result.error);
      setSaved(result.value);
      setDescription(result.value.rewardDescription);
      setValidity(String(result.value.expiresInDays));
      setError("");
      setMessage("Loyalty settings saved.");
    });
  }

  return (
    <SettingsSection
      title="Loyalty program"
      description="Fidelity Wallet configures your program. Settings you are allowed to change can be edited here."
    >
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {editable.length > 0 ? (
            <Badge tone="brand">{editable.length} editable {editable.length === 1 ? "setting" : "settings"}</Badge>
          ) : (
            <Badge tone="neutral">All settings managed by Fidelity Wallet</Badge>
          )}
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <LockedField label="Stamps required" value={`${saved.stampsRequired} stamps`} />
          <LockedField label="Reward" value={saved.rewardTitle} />

          {canEdit("rewardDescription") ? (
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Reward description
              <input
                required
                maxLength={120}
                value={description}
                onChange={(e) => { setDescription(e.target.value); setMessage(""); }}
                className={inputClass}
              />
            </label>
          ) : (
            <div className="sm:col-span-2"><LockedField label="Reward description" value={saved.rewardDescription} /></div>
          )}

          {canEdit("expiresInDays") ? (
            <label className="text-sm font-medium text-slate-700">
              Reward valid for (days)
              <input
                type="number"
                required
                min={30}
                max={730}
                value={validity}
                onChange={(e) => { setValidity(e.target.value); setMessage(""); }}
                className={inputClass}
              />
              <span className="mt-1 block text-xs font-normal text-slate-400">Between 30 and 730 days.</span>
            </label>
          ) : (
            <LockedField label="Reward valid for" value={`${saved.expiresInDays} days`} />
          )}

          {editable.length > 0 && (
            <div className="sm:col-span-2">
              <FormFooter dirty={dirty} pending={pending} error={error} saved={message} />
            </div>
          )}
        </form>
      </Card>
    </SettingsSection>
  );
}
