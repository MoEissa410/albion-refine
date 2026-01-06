"use client";

import React from "react";
import { ItemIcon as TierIcon } from "@/components/shared/ItemIcon";
import { formatMoney } from "@/lib/formatters";
import { getRefineDisplayName } from "@/lib/refine-items";
import { ResourceType, CardMetrics } from "@/hooks/use-refine-store";
import { ResourceStyle } from "@/lib/resource-utils";

interface RefineCardHeaderProps {
  tier: number;
  enchant: number;
  resourceType: ResourceType;
  refinedItemId: string;
  resStyle: ResourceStyle;
  metrics: CardMetrics;
}

export function RefineCardHeader({
  tier,
  enchant,
  resourceType,
  refinedItemId,
  resStyle,
  metrics,
}: RefineCardHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className={`absolute inset-0 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity ${resStyle.glow}`}
          />
          <TierIcon
            itemId={refinedItemId}
            className="relative w-16 h-16 rounded-2xl shadow-lg border-2 border-white/10"
            autoAnimate
          />
        </div>
        <div className="space-y-0.5">
          <p
            className={`text-[10px] uppercase font-black tracking-[0.2em] ${resStyle.text}`}
          >
            {getRefineDisplayName(resourceType, "refined")} Refining
          </p>
          <h3 className="text-2xl font-black tracking-tighter">
            T{tier}
            {enchant > 0 ? `.${enchant}` : ""}
          </h3>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1 opacity-60">
          ESTIMATED PROFIT
        </p>
        {!metrics.isReliable ? (
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md animate-pulse">
              MISSING DATA
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/60 mt-1 italic">
              Estimating from cost
            </span>
          </div>
        ) : (
          <>
            <p
              className={`text-2xl font-black tracking-tight ${
                metrics.totalProfit >= 0
                  ? "text-green-500"
                  : "text-red-500 drop-shadow-sm text-red-400"
              }`}
            >
              {formatMoney(metrics.totalProfit)}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground/80 lowercase italic">
              {formatMoney(metrics.profitPerUnit)} / unit
            </p>
          </>
        )}
      </div>
    </div>
  );
}
