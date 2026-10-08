"use client";

import { useState } from "react";
import { Gift, Plus, Search, Stamp, Users } from "lucide-react";
import { awardStamp, redeemReward } from "@/app/r/[restaurantId]/customers/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { cn, formatNumber, initials } from "@/lib/utils";
import type { Customer } from "@/types";

type CustomerFilter = "all" | "ready" | "in-progress";

export function CustomerManagement({
  restaurantId,
  initialCustomers,
  stampsRequired,
  rewardTitle,
}: {
  restaurantId: string;
  initialCustomers: Customer[];
  stampsRequired: number;
  rewardTitle: string;
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [statusMessage, setStatusMessage] = useState("");

  const readyCount = customers.filter((customer) => customer.stamps >= stampsRequired).length;
  const totalStamps = customers.reduce((total, customer) => total + customer.stamps, 0);
  const visibleCustomers = customers.filter((customer) => {
    const matchesSearch = `${customer.name} ${customer.memberId}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "ready" && customer.stamps >= stampsRequired) ||
      (filter === "in-progress" && customer.stamps < stampsRequired);
    return matchesSearch && matchesFilter;
  });

  function applyUpdate(updated: Customer | null, successMessage: (customer: Customer) => string) {
    if (!updated) {
      setStatusMessage("This action could not be completed.");
      return;
    }
    setCustomers((current) => current.map((customer) => (customer.id === updated.id ? updated : customer)));
    setStatusMessage(successMessage(updated));
  }

  async function handleAwardStamp(customerId: string) {
    applyUpdate(await awardStamp(restaurantId, customerId), (c) => `Stamp awarded to ${c.name}.`);
  }

  async function handleRedeemReward(customerId: string) {
    applyUpdate(await redeemReward(restaurantId, customerId), (c) => `${rewardTitle} redeemed for ${c.name}.`);
  }

  const filters: { id: CustomerFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: customers.length },
    { id: "ready", label: "Reward ready", count: readyCount },
    { id: "in-progress", label: "In progress", count: customers.length - readyCount },
  ];

  return (
    <>
      <section aria-label="Customer program summary" className="grid gap-4 sm:grid-cols-3">
        <Stat label="Loyalty members" value={formatNumber(customers.length)} icon={Users}>
          Sample profiles in this restaurant
        </Stat>
        <Stat label="Reward ready" value={formatNumber(readyCount)} icon={Gift}>
          {rewardTitle}
        </Stat>
        <Stat label="Stamps on cards" value={formatNumber(totalStamps)} icon={Stamp}>
          Reward at {stampsRequired} stamps
        </Stat>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search by customer name or member ID</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or member ID"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div role="group" aria-label="Filter customers" className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {filters.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === id ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900",
              )}
            >
              {label} <span className="ml-1 text-slate-400">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-medium">Member ID</th>
                <th scope="col" className="w-60 px-4 py-3 font-medium">Stamp progress</th>
                <th scope="col" className="px-4 py-3 font-medium">Last visit</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCustomers.map((customer) => {
                const rewardReady = customer.stamps >= stampsRequired;
                const progress = Math.min((customer.stamps / stampsRequired) * 100, 100);

                return (
                  <tr key={customer.id} className="align-middle transition-colors hover:bg-slate-50/60">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-slate-900">
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                          {initials(customer.name)}
                        </span>
                        {customer.name}
                      </span>
                    </th>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{customer.memberId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          role="progressbar"
                          aria-label={`${customer.name} stamp progress`}
                          aria-valuemin={0}
                          aria-valuemax={stampsRequired}
                          aria-valuenow={customer.stamps}
                          className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"
                        >
                          <div
                            className={cn("h-full rounded-full", rewardReady ? "bg-emerald-500" : "bg-brand-600")}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="whitespace-nowrap text-xs font-medium tabular-nums text-slate-700">
                          {customer.stamps}/{stampsRequired}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        {rewardReady ? (
                          <Badge tone="success">Reward ready</Badge>
                        ) : (
                          <span className="text-xs text-slate-400">{stampsRequired - customer.stamps} to go</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{customer.lastVisit}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" disabled={rewardReady} onClick={() => handleAwardStamp(customer.id)}>
                          <Plus size={14} />
                          Award stamp
                        </Button>
                        <Button size="sm" variant="primary" disabled={!rewardReady} onClick={() => handleRedeemReward(customer.id)}>
                          <Gift size={14} />
                          Redeem
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCustomers.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {customers.length === 0 ? "No sample customers for this restaurant yet." : "No customers match this search."}
          </p>
        )}
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-medium text-emerald-700">
        {statusMessage}
      </p>
    </>
  );
}
