"use client";

import React from "react";
import { Search } from "lucide-react";
import { getItemIcon } from "@/lib/search";

/**
 * ItemDisplayHeader Component
 *
 * The hero section of the search result page.
 * Shows the item image, tier badge, name, and selection/sorting buttons.
 */

interface ItemDisplayHeaderProps {
  itemId: string;
  itemName: string;
  tier: string;
  enchantment: string;
  sortBy: string;
  setSortBy: (v: "sell_low" | "sell_high" | "buy_high" | "buy_low") => void;
}

export default function ItemDisplayHeader({
  itemId,
  itemName,
  tier,
  enchantment,
  sortBy,
  setSortBy,
}: ItemDisplayHeaderProps) {
  return (
    <div className="glass-card flex flex-col xl:flex-row items-center gap-8 p-6 sm:p-8 border-black/5 dark:border-white/5 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      {/* Left Group: Icon + Title */}
      <div className="flex flex-col md:flex-row items-center gap-6 flex-1 min-w-0 w-full">
        <div className="shrink-0 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center border border-black/5 dark:border-white/10 shadow-inner group">
          <img
            src={getItemIcon(itemId)}
            alt={itemId}
            className="w-24 h-24 object-contain transition-transform duration-500"
            onError={(e) => ((e.target as HTMLImageElement).src = "/logo1.svg")}
          />
        </div>

        <div className="flex-1 min-w-0 w-full text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black tracking-tighter uppercase text-gradient truncate max-w-full">
              {itemName || itemId.replace("_", " ")}
            </h1>
            <div className="shrink-0 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
              Tier {tier}.{enchantment}
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> {itemId}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
              Live Market Pulse
            </span>
          </div>
        </div>
      </div>

      {/* Right Group: Sorting & Action Buttons */}
      <div className="shrink-0 flex flex-col gap-2 w-full xl:w-auto border-t xl:border-t-0 border-black/5 dark:border-white/5 pt-6 xl:pt-0">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center xl:justify-end gap-2 glass p-1.5 rounded-2xl border-black/5 dark:border-white/10">
          <SortButton
            active={sortBy === "sell_low"}
            onClick={() => setSortBy("sell_low")}
            label="Lowest Sell"
          />
          <SortButton
            active={sortBy === "sell_high"}
            onClick={() => setSortBy("sell_high")}
            label="Highest Sell"
          />
          <SortButton
            active={sortBy === "buy_low"}
            onClick={() => setSortBy("buy_low")}
            label="Lowest Buy"
          />
          <SortButton
            active={sortBy === "buy_high"}
            onClick={() => setSortBy("buy_high")}
            label="Highest Buy"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component for Sorting Buttons to reduce redundancy
 */
function SortButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-colors cursor-pointer ${
        active ? "bg-primary text-white shadow-md" : "hover:bg-primary/5"
      }`}
    >
      {label}
    </button>
  );
}
