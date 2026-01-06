"use client";

import React from "react";
import { Search, Flame } from "lucide-react";
import { ItemIcon } from "@/components/shared/ItemIcon";

/**
 * SEARCH FEATURE: ITEM DISPLAY HEADER
 *
 * The "Hero" section for an item's detail page.
 * Displays primary item identity and sorting controls.
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
    <div className="glass-card flex flex-col xl:flex-row items-center gap-8 p-6 sm:p-8 border-black/5 dark:border-white/5 relative overflow-hidden backdrop-blur-3xl">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      {/* Item Identity Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 flex-1 min-w-0 w-full relative z-10">
        <div className="shrink-0 p-1 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-inner">
          <ItemIcon
            itemId={itemId}
            size="xl"
            className="rounded-[1.75rem]"
            autoAnimate
          />
        </div>

        <div className="flex-1 min-w-0 w-full text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 mb-3">
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-black tracking-tighter uppercase text-gradient truncate max-w-full drop-shadow-sm">
              {itemName || itemId.replace("_", " ")}
            </h1>
            <div className="shrink-0 px-4 py-1.5 bg-primary text-white text-[11px] font-black rounded-full uppercase tracking-[0.2em] border border-white/20 shadow-lg shadow-primary/20">
              T{tier}.{enchantment}
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-5 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-80">
            <span className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5">
              <Search className="w-3.5 h-3.5 text-primary" /> {itemId}
            </span>
            <span className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />{" "}
              Live Market Data
            </span>
          </div>
        </div>
      </div>

      {/* Sorting Strategy Controls */}
      <div className="shrink-0 flex flex-col gap-3 w-full xl:w-auto border-t xl:border-t-0 border-black/5 dark:border-white/5 pt-6 xl:pt-0">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground text-center xl:text-right opacity-40">
          Price Sorting
        </p>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center xl:justify-end gap-2.5 glass p-2 rounded-2xl border-black/5 dark:border-white/10 shadow-inner">
          <SortButton
            active={sortBy === "sell_low"}
            onClick={() => setSortBy("sell_low")}
            label="Lowest Sell"
            theme="emerald"
          />
          <SortButton
            active={sortBy === "sell_high"}
            onClick={() => setSortBy("sell_high")}
            label="Highest Sell"
            theme="emerald"
          />
          <SortButton
            active={sortBy === "buy_high"}
            onClick={() => setSortBy("buy_high")}
            label="Highest Buy"
            theme="sky"
          />
          <SortButton
            active={sortBy === "buy_low"}
            onClick={() => setSortBy("buy_low")}
            label="Lowest Buy"
            theme="sky"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * REUSABLE UI: SORT BUTTON
 */
interface SortButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  theme?: "emerald" | "sky";
}

function SortButton({
  active,
  onClick,
  label,
  theme = "emerald",
}: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-[9px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 ${
        active
          ? theme === "emerald"
            ? "bg-emerald-500 text-white"
            : "bg-sky-500 text-white"
          : "bg-black/5 dark:bg-white/5 hover:bg-primary/10 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}
