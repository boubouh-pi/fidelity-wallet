"use client";

import { useState } from "react";
import { Gift, Plus, Search } from "lucide-react";
import { awardStamp, redeemReward } from "@/app/r/[restaurantId]/customers/actions";
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
      <section aria-label="Customer program summary" className="grid gap-3 sm:grid-cols-3">
        <Summary label="Sample profiles" value={customers.length.toLocaleString()} detail="In this restaurant" />
        <Summary label="Reward ready" value={readyCount.toLocaleString()} detail={rewardTitle} />
        <Summary label="Stamps on cards" value={totalStamps.toLocaleString()} detail={`Reward at ${stampsRequired} stamps`} />
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search by customer name or member ID</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customers"
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </label>

        <div role="group" aria-label="Filter customers" className="flex flex-wrap gap-1 rounded-lg bg-neutral-100 p-1">
          {filters.map(({ id, label, count }) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {label} <span className="ml-1 text-neutral-400">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-medium">Member ID</th>
                <th scope="col" className="w-56 px-4 py-3 font-medium">Stamp progress</th>
                <th scope="col" className="px-4 py-3 font-medium">Last visit</th>
                <th scope="col" className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visibleCustomers.map((customer) => {
                const rewardReady = customer.stamps >= stampsRequired;
                const progress = Math.min((customer.stamps / stampsRequired) * 100, 100);

                return (
                  <tr key={customer.id} className="align-middle">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-neutral-900">
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                          {customer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        {customer.name}
                      </span>
                    </th>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{customer.memberId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          role="progressbar"
                          aria-label={`${customer.name} stamp progress`}
                          aria-valuemin={0}
                          aria-valuemax={stampsRequired}
                          aria-valuenow={customer.stamps}
                          className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100"
                        >
                          <div className="h-full rounded-full bg-emerald-700" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="whitespace-nowrap text-xs text-neutral-600">
                          {customer.stamps}/{stampsRequired}
                        </span>
                      </div>
                      <span className={`mt-1 block text-[11px] ${rewardReady ? "font-medium text-emerald-700" : "text-neutral-400"}`}>
                        {rewardReady ? "Reward ready" : `${stampsRequired - customer.stamps} to go`}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">{customer.lastVisit}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={rewardReady}
                          onClick={() => handleAwardStamp(customer.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                          Award stamp
                        </button>
                        <button
                          type="button"
                          disabled={!rewardReady}
                          onClick={() => handleRedeemReward(customer.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-neutral-900 px-2.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Gift size={14} />
                          Redeem
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleCustomers.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">
            {customers.length === 0 ? "No sample customers for this restaurant yet." : "No customers match this search."}
          </p>
        )}
      </div>

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-emerald-700">
        {statusMessage}
      </p>
    </>
  );
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border-y border-neutral-200 py-3">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">{value}</p>
      <p className="mt-0.5 truncate text-xs text-neutral-400">{detail}</p>
    </div>
  );
}