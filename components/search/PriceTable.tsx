"use client";

import React from "react";
import { AlbionPrice, ALBION_QUALITIES } from "@/lib/prices";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  ArrowUpRight,
  Minus,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { getItemIcon } from "@/lib/search";
import RelativeTime from "./RelativeTime";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * PriceTable Component
 *
 * Renders a grid of cards showing market prices for an item across different cities.
 */

interface PriceTableProps {
  prices: AlbionPrice[];
  isLoading: boolean;
}

export default function PriceTable({ prices, isLoading }: PriceTableProps) {
  // Skeleton Loading State for smooth UX
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {prices.map((price, index) => {
        const hasPrice = price.sell_price_min > 0;
        const iconUrl = getItemIcon(price.item_id);
        const qualityData = ALBION_QUALITIES.find(
          (q) => q.id === price.quality
        );

        return (
          <motion.div
            key={`${price.city}-${price.quality}-${price.item_id}-${index}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={`glass-card flex flex-col p-4 relative group border-black/5 dark:border-white/5 transition-all hover:bg-white/95 dark:hover:bg-black/60 shadow-sm hover:shadow-xl ${
              !hasPrice ? "opacity-50 grayscale" : ""
            }`}
          >
            <div className="flex flex-col h-full gap-4">
              {/* Card Header: City, Icon & Verification Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/10 ${
                      hasPrice ? "bg-primary/5" : "bg-muted"
                    }`}
                  >
                    <img
                      src={iconUrl}
                      alt="Item icon"
                      className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black tracking-tight leading-none uppercase flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{price.city}</span>
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1 truncate">
                      {qualityData?.name || "Normal"}
                    </p>
                  </div>
                </div>

                <div
                  className={`shrink-0 text-[10px] font-black uppercase flex items-center gap-1 px-3 py-1 rounded-full ${
                    hasPrice
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {hasPrice ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                  {hasPrice ? "Verified" : "Stale"}
                </div>
              </div>

              {/* Price Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 bg-gradient-to-br from-emerald-500/5 to-green-500/5 p-3 rounded-xl border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <Tag className="w-3 h-3" /> Sell Price
                  </div>
                  <div className="text-xl font-black tracking-tighter text-emerald-700 dark:text-emerald-300 drop-shadow-sm">
                    {price.sell_price_min > 0 ? (
                      <>
                        {price.sell_price_min.toLocaleString()}
                        <span className="text-[11px] ml-1.5 font-bold text-emerald-600/60 dark:text-emerald-400/60">
                          Silver
                        </span>
                      </>
                    ) : (
                      <span className="opacity-30">N/A</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-3 rounded-xl border-2 border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    <ShoppingCart className="w-3 h-3" /> Buy Order
                  </div>
                  <div className="text-xl font-black tracking-tighter text-blue-700 dark:text-blue-300 drop-shadow-sm">
                    {price.buy_price_max > 0 ? (
                      <>
                        {price.buy_price_max.toLocaleString()}
                        <span className="text-[11px] ml-1.5 font-bold text-blue-600/60 dark:text-blue-400/60">
                          Silver
                        </span>
                      </>
                    ) : (
                      <span className="opacity-30">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Last Updated Footer */}
              <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                  <Clock className="w-3 h-3" />
                  {hasPrice ? (
                    <RelativeTime dateString={price.sell_price_min_date} />
                  ) : (
                    "No Data"
                  )}
                </div>
                <div className="text-[9px] font-black uppercase text-primary tracking-widest group-hover:underline">
                  Market API
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
