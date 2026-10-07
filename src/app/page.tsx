import { redirect } from "next/navigation";
import { restaurantBasePath } from "@/config/navigation";
import { listRestaurants } from "@/services";

/**
 * Temporary entry point. Until authentication exists, send visitors to the
 * first demo restaurant. Later: logged-in restaurant users go to their own
 * restaurant, Fidelity Wallet staff go to the admin area.
 */
export default async function Home() {
  const [first] = await listRestaurants();
  redirect(restaurantBasePath(first.id));
}
