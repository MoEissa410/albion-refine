"use client";

import React from "react";
import { AlbionPrice, ALBION_QUALITIES } from "@/lib/prices";
import { getCityStyle } from "@/lib/city-utils";
import { getQualityStyle } from "@/lib/quality-utils";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowUpRight,
  Minus,
  ShoppingCart,
  Tag,
  Clock,
} from "lucide-react";
import { ItemIcon } from "@/components/shared/ItemIcon";
import RelativeTime from "@/components/shared/RelativeTime";
import { formatMoney } from "@/lib/formatters";

/**
 * SEARCH FEATURE: PRICE CARD
 *
 * Individual card displaying market data for one city/quality pair.
 */

interface PriceCardProps {
  price: AlbionPrice;
  index: number;
}

export function PriceCard({ price, index }: PriceCardProps) {
  const hasPrice = price.sell_price_min > 0 || price.buy_price_max > 0;
  const qualityData = ALBION_QUALITIES.find((q) => q.id === price.quality);
  const cityStyle = getCityStyle(price.city);
  const qualityStyle = getQualityStyle(price.quality);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card flex flex-col p-4 relative group transition-all hover:bg-white/95 dark:hover:bg-black/60 shadow-sm hover:shadow-xl ${
        !hasPrice
          ? "opacity-50 grayscale border-black/5 dark:border-white/5"
          : `border-l-4 ${cityStyle.border}`
      }`}
      style={hasPrice ? { borderLeftColor: "currentColor" } : {}}
    >
      <div
        className={`flex flex-col h-full gap-4 ${
          hasPrice ? cityStyle.text : ""
        }`}
      >
        {/* Header: City & quality */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ItemIcon
              itemId={price.item_id}
              size="sm"
              className={hasPrice ? `${cityStyle.bg} ${cityStyle.border}` : ""}
            />
            <div className="flex-1 min-w-0">
              <h3
                className={`text-base font-black tracking-tight leading-none uppercase flex items-center gap-1.5 truncate ${
                  hasPrice ? cityStyle.text : "text-card-foreground"
                }`}
              >
                <MapPin
                  className={`w-3.5 h-3.5 shrink-0 ${
                    hasPrice ? cityStyle.iconColor : ""
                  }`}
                />
                <span className="truncate">{price.city}</span>
              </h3>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.15em] mt-1 truncate ${
                  hasPrice ? qualityStyle.text : "text-muted-foreground"
                }`}
              >
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

        {/* Pricing Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sell Column */}
          <div className="space-y-2 bg-gradient-to-br from-emerald-500/5 to-green-500/5 p-3 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <Tag className="w-3 h-3" /> Sell Price
            </div>
            <div className="text-xl font-black tracking-tighter text-emerald-700 dark:text-emerald-300">
              {price.sell_price_min > 0 ? (
                <>
                  {formatMoney(price.sell_price_min)}
                  <span className="text-[11px] ml-1.5 font-bold opacity-50">
                    Silver
                  </span>
                </>
              ) : (
                <span className="opacity-30">N/A</span>
              )}
            </div>
          </div>

          {/* Buy Column */}
          <div className="space-y-2 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-3 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              <ShoppingCart className="w-3 h-3" /> Buy Order
            </div>
            <div className="text-xl font-black tracking-tighter text-blue-700 dark:text-blue-300">
              {price.buy_price_max > 0 ? (
                <>
                  {formatMoney(price.buy_price_max)}
                  <span className="text-[11px] ml-1.5 font-bold opacity-50">
                    Silver
                  </span>
                </>
              ) : (
                <span className="opacity-30">N/A</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Freshness */}
        <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
            <Clock className="w-3 h-3" />
            {hasPrice ? (
              <RelativeTime
                dateString={
                  price.sell_price_min > 0
                    ? price.sell_price_min_date
                    : price.buy_price_max_date
                }
              />
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
}
