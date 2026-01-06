"use client";

import React from "react";
import { AlbionPrice } from "@/lib/prices";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceCard } from "./PriceCard";

/**
 * SEARCH FEATURE: PRICE TABLE
 *
 * Orchestrates a grid of PriceCards and handles the loading state.
 */

interface PriceTableProps {
  prices: AlbionPrice[];
  isLoading: boolean;
}

export default function PriceTable({ prices, isLoading }: PriceTableProps) {
  // Balanced Skeleton State for smooth visual transition
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  // Filter out completely empty market data
  const validPrices = prices.filter(
    (price) => price.sell_price_min > 0 || price.buy_price_max > 0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {validPrices.map((price, index) => (
        <PriceCard
          key={`${price.city}-${price.quality}-${price.item_id}`}
          price={price}
          index={index}
        />
      ))}

      {validPrices.length === 0 && (
        <div className="col-span-full py-12 text-center glass-card border-dashed">
          <p className="text-muted-foreground font-medium italic">
            No market data found for the current filters.
          </p>
        </div>
      )}
    </div>
  );
}
