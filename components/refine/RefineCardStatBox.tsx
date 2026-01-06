"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { ItemIcon as TierIcon } from "@/components/shared/ItemIcon";
import { getCityStyle } from "@/lib/city-utils";
import { formatMoney } from "@/lib/formatters";
import RelativeTime from "@/components/shared/RelativeTime";

interface RefineCardStatBoxProps {
  city: string;
  typeLabel: string;
  typeLabelClass: string;
  displayName: string;
  amountLabel?: string;
  timestamp?: string;
  marketPriceLabel: string;
  isMarketPriceReliable: boolean;
  itemId: string;
  inputValue: number;
  inputColorClass: string;
  onInputChange: (value: number) => void;
  footer?: {
    label: string;
    value: string;
  };
}

export function RefineCardStatBox({
  city,
  typeLabel,
  typeLabelClass,
  displayName,
  amountLabel,
  timestamp,
  marketPriceLabel,
  isMarketPriceReliable,
  itemId,
  inputValue,
  inputColorClass,
  onInputChange,
  footer,
}: RefineCardStatBoxProps) {
  const cityStyle = getCityStyle(city);

  return (
    <div className="relative p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-white/5 space-y-3 group/box overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/box:opacity-30 transition-opacity">
        <span className="text-3xl font-black uppercase tracking-tighter -rotate-12 block">
          {city.substring(0, 2)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${cityStyle.bg.split(" ")[0]}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${cityStyle.text}`}
          >
            {city}
          </span>
        </div>
        {timestamp && (
          <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground opacity-60">
            <Clock className="w-2.5 h-2.5" />
            <RelativeTime dateString={timestamp} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between font-black">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase ${typeLabelClass}`}
          >
            {typeLabel}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase">
            {displayName}
          </span>
          {amountLabel && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary uppercase">
              {amountLabel}
            </span>
          )}
        </div>
        <span
          className={`text-[9px] font-bold ${
            isMarketPriceReliable ? "text-green-500/50" : "text-amber-500"
          }`}
        >
          {marketPriceLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <TierIcon
          itemId={itemId}
          className="w-10 h-10 rounded-xl"
          autoAnimate
        />
        <div className="relative flex-1">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => onInputChange(Number(e.target.value) || 0)}
            className={`glass-input h-10 bg-background/40 border-none rounded-xl text-sm font-black focus-visible:ring-primary/40 pl-3 ${inputColorClass}`}
          />
        </div>
      </div>

      {footer && (
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase opacity-50">
            {footer.label}
          </span>
          <span className="text-[10px] font-black text-muted-foreground">
            {footer.value}
          </span>
        </div>
      )}
    </div>
  );
}
