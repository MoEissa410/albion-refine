"use client";

import React, { useMemo } from "react";
import { AlbionItem } from "@/lib/types";
import { withEnchant } from "@/lib/search";
import { useQuery } from "@tanstack/react-query";
import { getItemPrices } from "@/lib/prices";
import { ItemMatchCard } from "./ItemMatchCard";

/**
 * SEARCH FEATURE: SEARCH RESULTS LIST
 *
 * Orchestrates broad search results when the query matches multiple items.
 * Performs batch price fetching for all results to show a 1x1 market overview.
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
  // 1. Prepare Batch Request IDs
  const targetIds = useMemo(() => {
    return items.map((item) => {
      // If enchantment is "0", preserve original ID. Else override.
      if (enchantment && enchantment !== "0") {
        return withEnchant(item.UniqueName, enchantment);
      }
      return item.UniqueName;
    });
  }, [items, enchantment]);

  const joinedIds = targetIds.join(",");

  // 2. Batch Fetch Preview Prices
  const {
    data: batchPriceData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["batch_preview", joinedIds, selectedCities, selectedQualities],
    queryFn: () => getItemPrices(joinedIds, selectedCities, selectedQualities),
    staleTime: 60000,
    enabled: targetIds.length > 0,
    retry: 1,
  });

  return (
    <div className="space-y-6">
      {/* Search Result Banner */}
      <div className="glass-card p-6 border-black/5 dark:border-white/5 shadow-lg">
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">
          Multiple matches for{" "}
          <span className="text-primary tracking-normal">
            &quot;{query}&quot;
          </span>
        </h1>
        <p className="text-sm text-muted-foreground font-medium italic">
          Select an item below to view detailed market pricing across current
          filters.
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
        {items.map((item) => {
          const targetId =
            enchantment && enchantment !== "0"
              ? withEnchant(item.UniqueName, enchantment)
              : item.UniqueName;

          const itemPrices =
            batchPriceData?.filter((p) => p.item_id === targetId) || [];

          return (
            <ItemMatchCard
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
