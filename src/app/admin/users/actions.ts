"use server";

/** Account management actions. The services re-check that the caller is an admin. */
import { createAccount, deleteAccount, listAccounts, type NewAccount } from "@/services/accounts";

export async function createAccountAction(input: NewAccount) {
  const result = await createAccount({
    name: String(input?.name ?? ""),
    email: String(input?.email ?? ""),
    role: input?.role === "admin" ? "admin" : "restaurant",
    restaurantId: input?.restaurantId ? String(input.restaurantId) : null,
  });
  return result.ok ? { ...result, accounts: await listAccounts() } : result;
}

export async function deleteAccountAction(userId: string) {
  const result = await deleteAccount(String(userId));
  return result.ok ? { ...result, accounts: await listAccounts() } : result;
}
