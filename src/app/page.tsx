import { redirect } from "next/navigation";

/**
 * Temporary entry point. Until authentication exists, send visitors to the
 * Fidelity Wallet admin restaurant list. Later: logged-in restaurant users go
 * to their own restaurant, Fidelity Wallet staff go to the admin area.
 */
export default function Home() {
  redirect("/admin/restaurants");
}
