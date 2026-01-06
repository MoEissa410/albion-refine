"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock } from "lucide-react";
import { AlbionItem, AlbionPrice } from "@/lib/types";
import { formatMoney } from "@/lib/formatters";
import { getCityStyle } from "@/lib/city-utils";
import RelativeTime from "@/components/shared/RelativeTime";
import { ItemIcon } from "@/components/shared/ItemIcon";

/**
 * SEARCH FEATURE: ITEM MATCH CARD
 *
 * Displays a summary of one matching item from a broad search result list.
 */

interface ItemCardProps {
  item: AlbionItem;
  targetId: string;
  priceData: AlbionPrice[];
  isLoading: boolean;
  isError: boolean;
}

export function ItemMatchCard({
  item,
  targetId,
  priceData,
  isLoading,
  isError,
}: ItemCardProps) {
  const itemHref = `/search?q=${encodeURIComponent(targetId)}`;

  // Find the most relevant market data (lowest sell price)
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
        {/* Optimized Icon */}
        <ItemIcon
          itemId={item.UniqueName}
          size="lg"
          className="border-black/10"
          autoAnimate
        />

        {/* Labels */}
        <div className="flex-1 flex flex-col min-w-0">
          <span className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors truncate">
            {item.LocalizedNames?.["EN-US"] || item.UniqueName}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1 truncate opacity-60">
            {item.UniqueName}
          </span>
        </div>

        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
      </div>

      {/* Pricing Data Preview */}
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
                  {formatMoney(lowestPrice)}
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
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-auto">
            <Clock className="w-3 h-3" />
            <RelativeTime dateString={latestUpdate} />
          </div>
        )}
      </div>
    </Link>
  );
}
