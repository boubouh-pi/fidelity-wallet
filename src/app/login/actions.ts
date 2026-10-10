"use server";

import { redirect } from "next/navigation";
import { homePath } from "@/auth/dal";
import { signIn, signOut } from "@/services/accounts";

export interface SignInState {
  error: string;
  email: string;
}

export async function signInAction(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const result = await signIn(email, String(formData.get("password") ?? ""));
  if (!result.ok) return { error: result.error, email };
  redirect(homePath(result.value));
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}
