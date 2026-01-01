"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { AlbionItem, AlbionPrice } from "@/lib/types";
import { getItemIcon, withEnchant } from "@/lib/search";
import { useQuery } from "@tanstack/react-query";
import { getItemPrices } from "@/lib/prices";
import { getCityStyle } from "@/lib/city-utils";
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
  selectedCities: string[];
  selectedQualities: number[];
  enchantment: string;
}

export default function SearchResultsList({
  items,
  query,
  selectedCities,
  selectedQualities,
  enchantment,
}: SearchResultsListProps) {
  // BATCH FETCHING STRATEGY
  const targetIds = React.useMemo(() => {
    return items.map((item) => {
      // If enchantment is "0" (default), we preserve the item's original ID (As-Is).
      // Only if the user strictly selects a non-zero enchantment (e.g. .1, .2) do we override.
      if (enchantment && enchantment !== "0") {
        return withEnchant(item.UniqueName, enchantment);
      }
      return item.UniqueName;
    });
  }, [items, enchantment]);

  const joinedIds = targetIds.join(",");

  // DEBUGGING: Log the IDs we are attempting to fetch to the browser console
  console.log(
    `[Search Debug] Fetching prices for Enchantment [${enchantment}]:`,
    joinedIds
  );

  const {
    data: batchPriceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["batch_preview", joinedIds, selectedCities, selectedQualities],
    queryFn: () => getItemPrices(joinedIds, selectedCities, selectedQualities),
    staleTime: 60000,
    enabled: targetIds.length > 0,
    retry: 1, // Minimize retries to avoid exacerbating rate limits
  });

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
        {items.map((item) => {
          // Same logic as batch: Default (0) -> As Is. Specific -> Override.
          const targetId =
            enchantment && enchantment !== "0"
              ? withEnchant(item.UniqueName, enchantment)
              : item.UniqueName;

          // Filter out only the prices relevant to this specific item
          const itemPrices =
            batchPriceData?.filter((p) => p.item_id === targetId) || [];

          return (
            <ItemCard
              key={item.UniqueName}
              item={item}
              targetId={targetId}
              priceData={itemPrices}
              isLoading={isLoading}
              isError={isError}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ItemCardProps {
  item: AlbionItem;
  targetId: string;
  priceData: AlbionPrice[];
  isLoading: boolean;
  isError: boolean;
}

function ItemCard({
  item,
  targetId,
  priceData,
  isLoading,
  isError,
}: ItemCardProps) {
  // Function to create href for the specific item variant
  const itemHref = `/search?q=${encodeURIComponent(targetId)}`;

  // Find the lowest sell price across all cities
  // Find the price entry with the lowest sell price across all cities
  const bestPrice = priceData?.reduce((best, p) => {
    if (
      p.sell_price_min > 0 &&
      (!best || p.sell_price_min < best.sell_price_min)
    ) {
      return p;
    }
    return best;
  }, null as AlbionPrice | null);

  const lowestPrice = bestPrice?.sell_price_min;
  const lowestPriceCity = bestPrice?.city;

  const latestUpdate = priceData?.find(
    (p) => p.sell_price_min > 0
  )?.sell_price_min_date;

  return (
    <Link
      href={itemHref}
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
              {isLoading ? (
                <span className="opacity-30">Loading...</span>
              ) : isError ? (
                <span className="text-[9px] font-bold text-red-400">
                  API Limit
                </span>
              ) : lowestPrice ? (
                <>
                  {lowestPrice.toLocaleString()}
                  <span className="text-[10px] ml-1 opacity-40">Silver</span>
                  {lowestPriceCity && (
                    <span
                      className={`block text-[10px] font-bold mt-0.5 ${
                        getCityStyle(lowestPriceCity).text
                      }`}
                    >
                      {lowestPriceCity}
                    </span>
                  )}
                </>
              ) : (
                <span className="opacity-30 text-xs">No Data</span>
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
