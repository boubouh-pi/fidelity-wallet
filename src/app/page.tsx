import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, homePath } from "@/auth/dal";

/** Entry point: signed-in users go to their home (admin list or their restaurant), others to the login page. */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <RedirectToHome />
    </Suspense>
  );
}

async function RedirectToHome(): Promise<null> {
  const user = await getCurrentUser();
  redirect(user ? homePath(user) : "/login");
}
