import { Check, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoyaltyCardPreviewData } from "@/types";

/** Visual preview of a wallet pass. Pure presentation: all data comes via props. */
export function LoyaltyCardPreview({ data }: { data: LoyaltyCardPreviewData }) {
  const { design, program } = data.card;
  const { stamps, customerName, memberId } = data.sample;
  const remaining = Math.max(program.stampsRequired - stamps, 0);

  return (
    <div
      className="w-full max-w-sm rounded-3xl p-6 text-white shadow-xl"
      style={{ backgroundColor: design.brandColor }}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-white/15">
          {design.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={design.logoUrl} alt="" className="size-11 rounded-full object-cover" />
          ) : (
            <Store size={20} />
          )}
        </div>
        <div>
          <p className="font-semibold leading-tight">{design.displayName}</p>
          <p className="text-xs text-white/70">{design.tagline}</p>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60">Reward</p>
          <p className="text-lg font-semibold">{program.rewardTitle}</p>
        </div>
        <p className="text-sm text-white/80">{stamps}/{program.stampsRequired}</p>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {Array.from({ length: program.stampsRequired }, (_, i) => {
          const filled = i < stamps;
          return (
            <div
              key={i}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full border-2",
                filled ? "border-transparent" : "border-white/30",
              )}
              style={filled ? { backgroundColor: design.accentColor, color: design.brandColor } : undefined}
            >
              {filled && <Check size={16} strokeWidth={3} />}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-white/70">
        {remaining > 0 ? `${remaining} more visits to unlock your reward` : "Reward unlocked!"}
      </p>

      <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60">Member</p>
          <p className="text-sm">{customerName}</p>
        </div>
        <p className="font-mono text-xs text-white/60">{memberId}</p>
      </div>
    </div>
  );
}
