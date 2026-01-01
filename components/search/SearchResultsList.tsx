"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { AlbionItem } from "@/lib/types";
import { getItemIcon } from "@/lib/search";
import { useQuery } from "@tanstack/react-query";
import { getItemPrices } from "@/lib/prices";
import RelativeTime from "./RelativeTime";

/**
 * SearchResultsList Component
 *
 * Displays a grid of cards when a search returns multiple possible matches.
 * Shows quick price preview for each item.
 */

interface SearchResultsListProps {
  items: AlbionItem[];
  query: string;
}

export default function SearchResultsList({
  items,
  query,
}: SearchResultsListProps) {
  return (
    <div className="space-y-6">
      {/* Search Result Banner */}
      <div className="glass-card p-6 border-black/5 dark:border-white/5">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
          Multiple matches for <span className="text-primary">"{query}"</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Select an item below to view detailed market pricing.
        </p>
      </div>

      {/* Grid of Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard key={item.UniqueName} item={item} />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: AlbionItem }) {
  // Fetch quick price preview for this item (Normal quality, all cities)
  const { data: priceData } = useQuery({
    queryKey: ["preview", item.UniqueName],
    queryFn: () => getItemPrices(item.UniqueName, [], [1]),
    staleTime: 60000,
  });

  // Find the lowest sell price across all cities
  const lowestPrice = priceData?.reduce((min, p) => {
    if (p.sell_price_min > 0 && (min === 0 || p.sell_price_min < min)) {
      return p.sell_price_min;
    }
    return min;
  }, 0);

  const latestUpdate = priceData?.find(
    (p) => p.sell_price_min > 0
  )?.sell_price_min_date;

  return (
    <Link
      href={`/search?q=${encodeURIComponent(item.UniqueName)}`}
      className="glass-card text-left p-4 transition-all flex flex-col gap-3 group border-black/5 dark:border-white/5 hover:bg-primary/5"
    >
      <div className="flex items-center gap-4">
        {/* Item Icon Container */}
        <div className="shrink-0 w-16 h-16 bg-black/5 dark:bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border border-black/10">
          <img
            src={getItemIcon(item.UniqueName)}
            alt={item.UniqueName}
            className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
          />
        </div>

        {/* Item Details */}
        <div className="flex-1 flex flex-col min-w-0">
          <span className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">
            {item.LocalizedNames?.["EN-US"] || item.UniqueName}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1 truncate opacity-60">
            {item.UniqueName}
          </span>
        </div>

        {/* Interaction Indicator */}
        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
      </div>

      {/* Price Preview */}
      <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Lowest Sell
            </span>
            <span className="text-sm font-black text-foreground">
              {lowestPrice ? (
                <>
                  {lowestPrice.toLocaleString()}
                  <span className="text-[10px] ml-1 opacity-40">Silver</span>
                </>
              ) : (
                <span className="opacity-30">Loading...</span>
              )}
            </span>
          </div>
        </div>

        {latestUpdate && (
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <RelativeTime dateString={latestUpdate} />
          </div>
        )}
      </div>
    </Link>
  );
}
