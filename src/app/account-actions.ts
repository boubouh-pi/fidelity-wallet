"use server";

/** Actions on the signed-in user's own account, shared by the restaurant and admin areas. */
import { changePassword } from "@/services/accounts";

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  return changePassword(String(currentPassword ?? ""), String(newPassword ?? ""));
}
