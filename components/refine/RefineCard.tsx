"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import {
  TierKey,
  selectCard,
  useRefineStore,
  ResourceType,
} from "@/hooks/use-refine-store";
import {
  getRefinedItemId,
  getRawItemId,
  getRefineDisplayName,
} from "@/lib/refine-items";
import { REFINING_RECIPES } from "@/lib/formulas";
import { formatMoney } from "@/lib/formatters";
import { getResourceStyle } from "@/lib/resource-utils";

import { RefineCardHeader } from "./RefineCardHeader";
import { RefineCardStatBox } from "./RefineCardStatBox";

/**
 * REFINE CARD COMPONENT
 *
 * Displays the profit analysis and market data for a specific tier/enchantment.
 * Handles user input for price overrides and visualizes profit margins.
 */

interface RefineCardProps {
  tier: number;
  enchant: number;
  tierKey: TierKey;
  resourceType: ResourceType;
  buyOrderCity: string;
  sellOrderCity: string;
}

export function RefineCard({
  tier,
  enchant,
  tierKey,
  resourceType,
  buyOrderCity,
  sellOrderCity,
}: RefineCardProps) {
  // Subscribe to specific card metrics
  const metrics = useRefineStore(
    useShallow((state) => selectCard(tier, enchant)(state))
  );

  // Market data & timestamps
  const timestamps = useRefineStore((state) => state.priceTimestamps[tierKey]);
  const marketPrice = useRefineStore((state) => state.marketPrices[tierKey]);
  const updatePrice = useRefineStore((state) => state.updatePrice);

  const buyPriceInput = metrics.buyPrice;
  const sellPriceInput = metrics.sellPrice;
  const refinedItemId = getRefinedItemId(resourceType, tier, enchant);
  const rawItemId = getRawItemId(resourceType, tier, enchant);

  const resStyle = getResourceStyle(resourceType);

  return (
    <div
      className="glass-card flex flex-col overflow-hidden rounded-[1.5rem] border-black/5 dark:border-white/5 shadow-lg group"
      translate="no"
    >
      <div className="relative p-4 space-y-3">
        <RefineCardHeader
          tier={tier}
          enchant={enchant}
          resourceType={resourceType}
          refinedItemId={refinedItemId}
          resStyle={resStyle}
          metrics={metrics}
          buyCity={buyOrderCity}
          sellCity={sellOrderCity}
        />

        {/* 2x1 Grid Layout */}
        <div className="grid grid-cols-2 gap-2.5 items-stretch">
          {/* Box 1: Primary Raw Material */}
          <div
            className={
              metrics.intermediateKey
                ? "col-span-1 h-full"
                : "col-span-2 h-full"
            }
          >
            <RefineCardStatBox
              city={buyOrderCity}
              typeLabel="Raw"
              typeLabelClass="bg-black/20 text-muted-foreground"
              displayName={getRefineDisplayName(resourceType, "raw")}
              amountLabel={`x${REFINING_RECIPES[tier]?.rawAmount || 0}`}
              timestamp={timestamps?.buy}
              marketPriceLabel={
                metrics.hasMarketPrices.buy
                  ? `Mkt: ${formatMoney(marketPrice?.buy || 0)}`
                  : "Price Missing"
              }
              isMarketPriceReliable={metrics.hasMarketPrices.buy}
              itemId={rawItemId}
              inputValue={buyPriceInput}
              inputColorClass="text-primary"
              onInputChange={(val) => updatePrice(tierKey, "buy", val)}
              action="Buy"
              className="h-full"
            />
          </div>

          {/* Box 2: Intermediate Material (T-1 Refined) - Only show if needed (T3+) */}
          {metrics.intermediateKey && (
            <div className="col-span-1 h-full">
              <RefineCardStatBox
                city={sellOrderCity}
                typeLabel="Ingredient"
                typeLabelClass="bg-amber-500/20 text-amber-500"
                displayName={getRefineDisplayName(resourceType, "refined")}
                amountLabel={`x${
                  REFINING_RECIPES[tier]?.refinedPrevAmount || 0
                }`}
                marketPriceLabel={
                  metrics.intermediatePrice > 0
                    ? `Mkt: ${formatMoney(metrics.intermediatePrice)}`
                    : "Price Missing"
                }
                isMarketPriceReliable={metrics.intermediatePrice > 0}
                itemId={getRefinedItemId(
                  resourceType,
                  parseInt(metrics.intermediateKey.split(".")[0]),
                  parseInt(metrics.intermediateKey.split(".")[1])
                )}
                inputValue={metrics.intermediatePrice}
                inputColorClass="text-amber-500"
                onInputChange={(val) => {
                  if (metrics.intermediateKey) {
                    updatePrice(metrics.intermediateKey, "sell", val);
                  }
                }}
                action="Buy"
                footer={{
                  label: "Prev Tier",
                  value: `T${metrics.intermediateKey}`,
                }}
                className="h-full"
              />
            </div>
          )}

          {/* Box 3: Product / Result (Full Width) */}
          <div className="col-span-2">
            <RefineCardStatBox
              city={sellOrderCity}
              typeLabel="Product"
              typeLabelClass="bg-green-500/20 text-green-500"
              displayName={getRefineDisplayName(resourceType, "refined")}
              timestamp={timestamps?.sell}
              marketPriceLabel={
                metrics.hasMarketPrices.sell
                  ? `Mkt: ${formatMoney(marketPrice?.sell || 0)}`
                  : "Price Missing"
              }
              isMarketPriceReliable={metrics.hasMarketPrices.sell}
              itemId={refinedItemId}
              inputValue={sellPriceInput}
              inputColorClass="text-green-500 focus-visible:ring-green-500/40"
              onInputChange={(val) => updatePrice(tierKey, "sell", val)}
              action="Sell"
              footer={{
                label: "Total Sales",
                value: formatMoney(
                  (sellPriceInput * metrics.totalProfit) /
                    (metrics.profitPerUnit || 1)
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Progress Bar Viz */}
      <div className="h-1 w-full bg-black/5 dark:bg-white/5 transition-colors duration-500">
        <div
          className={`h-full transition-all duration-1000 ${
            metrics.totalProfit >= 0 ? "bg-green-500/50" : "bg-red-500/50"
          }`}
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                (metrics.profitPerUnit / Math.max(1, metrics.costPerUnit)) *
                  1000
              )
            )}%`,
          }}
        />
      </div>
    </div>
  );
}
