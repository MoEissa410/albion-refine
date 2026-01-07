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
  action: "Buy" | "Sell";
  className?: string;
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
  action,
  className,
  footer,
}: RefineCardStatBoxProps) {
  const cityStyle = getCityStyle(city);

  return (
    <div
      className={`relative p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-white/5 flex flex-col justify-between group/box overflow-hidden ${className}`}
    >
      {/* City Watermark */}
      <div className="absolute top-0 right-0 p-1.5 opacity-5 group-hover/box:opacity-10 transition-opacity pointer-events-none">
        <span className="text-xl font-black uppercase tracking-tighter -rotate-12 block">
          {city.substring(0, 2)}
        </span>
      </div>

      <div className="space-y-2 flex-1 flex flex-col">
        {/* Row 1: Time/City Indicator (Stable Height) */}
        <div className="flex items-center justify-between min-h-[14px]">
          <div className="flex items-center gap-1 opacity-0">
            <div className="w-1 h-1 rounded-full" />
            <span className="text-[8px] font-black uppercase tracking-wider">
              {city}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground opacity-70">
            {timestamp ? (
              <>
                <Clock className="w-2 h-2" />
                <RelativeTime dateString={timestamp} />
              </>
            ) : (
              <span className="opacity-0">&nbsp;</span>
            )}
          </div>
        </div>

        {/* Row 2: Tags & Display Name (Stable Height) */}
        <div className="flex flex-col gap-1 font-black">
          <div className="flex items-center gap-1 flex-wrap min-h-[16px]">
            <span
              className={`text-[8px] px-1 py-0.5 rounded uppercase ${typeLabelClass}`}
            >
              {typeLabel}
            </span>
            <span
              className={`text-[8px] font-black uppercase ${cityStyle.text} flex items-center gap-0.5`}
            >
              {action} {city.substring(0, 6)}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase truncate max-w-[55px]">
              {displayName}
            </span>
            {amountLabel && (
              <span className="text-[8px] px-1 py-0.5 rounded bg-primary/20 text-primary uppercase">
                {amountLabel}
              </span>
            )}
          </div>
          <span
            className={`text-[8px] font-bold min-h-[12px] ${
              isMarketPriceReliable ? "text-green-500/50" : "text-amber-500"
            }`}
          >
            {marketPriceLabel}
          </span>
        </div>

        {/* Row 3: Icon & Price Input */}
        <div className="flex items-center gap-1.5 pt-1 mt-auto">
          <TierIcon
            itemId={itemId}
            className="w-7 h-7 rounded-lg"
            autoAnimate
          />
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="numeric"
              value={inputValue === 0 ? "" : inputValue}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                const num = val === "" ? 0 : Number(val);
                onInputChange(num);
              }}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              placeholder="0"
              className={`glass-input h-7 bg-background/40 border-none rounded-lg text-[11px] font-black focus-visible:ring-primary/40 pl-2 ${inputColorClass}`}
            />
          </div>
        </div>
      </div>

      {/* Row 4: Footer (Reserved space even if empty) */}
      <div
        className={`flex justify-between items-center px-0.5 pt-2 mt-2 border-t border-white/5 min-h-[22px] ${
          !footer ? "opacity-0" : ""
        }`}
      >
        <span className="text-[8px] font-extrabold text-muted-foreground uppercase opacity-40">
          {footer?.label || <>&nbsp;</>}
        </span>
        <span className="text-[9px] font-black text-muted-foreground">
          {footer?.value || <>&nbsp;</>}
        </span>
      </div>
    </div>
  );
}
