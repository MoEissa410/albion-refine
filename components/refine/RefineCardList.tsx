"use client";

import React, { useMemo } from "react";
import {
  TIER_LEVELS,
  ENCHANT_LEVELS,
  buildTierKey,
  useRefineStore,
} from "@/hooks/use-refine-store";
import { RefineCard } from "./RefineCard";

/**
 * REFINE CARD LIST COMPONENT
 *
 * Manages the generation and grid layout of all relevant refining cards
 * based on the selected resource and tier levels.
 */
export function RefineCardList() {
  const resourceType = useRefineStore((state) => state.resourceType);
  const buyOrderCity = useRefineStore((state) => state.buyOrderCity);
  const sellOrderCity = useRefineStore((state) => state.sellOrderCity);

  // Memoize the card definitions to prevent unnecessary re-renders
  const cards = useMemo(
    () =>
      TIER_LEVELS.filter((tier) => tier >= 2).flatMap((tier) => {
        const enchants = tier < 4 ? [0] : ENCHANT_LEVELS;
        return enchants.map((enchant) => ({
          tier,
          enchant,
          key: buildTierKey(tier, enchant),
        }));
      }),
    []
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {cards.map(({ tier, enchant, key }) => (
        <RefineCard
          key={key}
          tier={tier}
          enchant={enchant}
          tierKey={key}
          resourceType={resourceType}
          buyOrderCity={buyOrderCity}
          sellOrderCity={sellOrderCity}
        />
      ))}
    </div>
  );
}
