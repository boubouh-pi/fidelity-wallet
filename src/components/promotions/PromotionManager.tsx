"use client";

import { useState, useTransition } from "react";
import { CalendarClock, CalendarDays, CircleCheck, Info, Megaphone, Plus, X } from "lucide-react";
import { createPromotion, endPromotion } from "@/app/r/[restaurantId]/promotions/actions";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { addDays, formatDate, formatNumber } from "@/lib/utils";
import type { PromotionStatus, PromotionWithStatus } from "@/types";

const statusBadge: Record<PromotionStatus, { tone: BadgeTone; label: string }> = {
  active: { tone: "success", label: "Active" },
  scheduled: { tone: "brand", label: "Scheduled" },
  ended: { tone: "neutral", label: "Ended" },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export function PromotionManager({
  restaurantId,
  initialPromotions,
  today,
}: {
  restaurantId: string;
  initialPromotions: PromotionWithStatus[];
  /** Today's date from the server (YYYY-MM-DD), so both sides agree. */
  today: string;
}) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const count = (status: PromotionStatus) => promotions.filter((p) => p.status === status).length;

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await createPromotion(restaurantId, {
        title: String(data.get("title") ?? ""),
        description: String(data.get("description") ?? ""),
        startDate: String(data.get("startDate") ?? ""),
        endDate: String(data.get("endDate") ?? ""),
      });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      setPromotions(result.promotions);
      setFormError("");
      setFormOpen(false);
      form.reset();
      setStatusMessage("Promotion created.");
    });
  }

  function handleEnd(promotion: PromotionWithStatus) {
    const verb = promotion.status === "active" ? "End" : "Cancel";
    if (!window.confirm(`${verb} "${promotion.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await endPromotion(restaurantId, promotion.id);
      if (!result.ok) {
        setStatusMessage(result.error);
        return;
      }
      setPromotions(result.promotions);
      setStatusMessage(`"${promotion.title}" ${promotion.status === "active" ? "ended" : "cancelled"}.`);
    });
  }

  return (
    <>
      <PageHeader
        title="Promotions"
        description="Limited-time offers for your loyalty members."
        action={
          !formOpen && (
            <Button variant="primary" onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              New promotion
            </Button>
          )
        }
      />

      <section aria-label="Promotions summary" className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active" value={formatNumber(count("active"))} icon={Megaphone}>Running today</Stat>
        <Stat label="Scheduled" value={formatNumber(count("scheduled"))} icon={CalendarClock}>Starting later</Stat>
        <Stat label="Ended" value={formatNumber(count("ended"))} icon={CircleCheck}>Past promotions</Stat>
      </section>

      {formOpen && (
        <Card className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-900">New promotion</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => { setFormOpen(false); setFormError(""); }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Title
              <input name="title" required maxLength={60} placeholder="e.g. Double stamps on Tuesdays" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Description <span className="font-normal text-slate-400">(optional)</span>
              <textarea name="description" rows={2} maxLength={200} placeholder="What do customers get?" className={inputClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Start date
              <input name="startDate" type="date" required defaultValue={today} className={inputClass} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              End date
              <input name="endDate" type="date" required min={today} defaultValue={addDays(today, 30)} className={inputClass} />
            </label>
            {formError && <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-2">{formError}</p>}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button onClick={() => { setFormOpen(false); setFormError(""); }}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Creating..." : "Create promotion"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {promotions.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-medium text-slate-900">No promotions yet</p>
            <p className="mt-1 text-sm text-slate-500">Create your first offer to give your loyalty members a reason to come back.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {promotions.map((p) => {
              const badge = statusBadge[p.status];
              return (
                <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={p.status === "ended" ? "font-medium text-slate-500" : "font-medium text-slate-900"}>{p.title}</p>
                      <Badge tone={badge.tone}>{p.endedEarly ? "Ended early" : badge.label}</Badge>
                    </div>
                    {p.description && <p className="mt-1 text-sm text-slate-500">{p.description}</p>}
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays size={13} />
                      {formatDate(p.startDate)} – {formatDate(p.endDate)}
                    </p>
                  </div>
                  {p.status !== "ended" && (
                    <Button size="sm" disabled={pending} onClick={() => handleEnd(p)}>
                      {p.status === "active" ? "End now" : "Cancel"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-medium text-emerald-700">
        {statusMessage}
      </p>

      <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
        <Info size={14} className="mt-0.5 shrink-0" />
        Promotions are listed here for your team. Showing them on customers&apos; wallet cards will come with the Apple Wallet and Google Wallet integration.
      </p>
    </>
  );
}
