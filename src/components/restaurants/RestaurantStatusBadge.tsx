import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { Restaurant } from "@/types";

const tones: Record<Restaurant["status"], BadgeTone> = {
  active: "success",
  onboarding: "warning",
  paused: "neutral",
};

const labels: Record<Restaurant["status"], string> = {
  active: "Active",
  onboarding: "Onboarding",
  paused: "Paused",
};

export function RestaurantStatusBadge({ status }: { status: Restaurant["status"] }) {
  return <Badge tone={tones[status]}>{labels[status]}</Badge>;
}
