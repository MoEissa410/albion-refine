"use client";

import React, { useEffect } from "react";
import { TierKey, TierPrice, useRefineStore } from "@/hooks/use-refine-store";
import { useRefinePrices } from "@/hooks/use-refine-prices";

// Atomic Components
import { RefineHeader } from "./RefineHeader";
import { RefineControls } from "./RefineControls";
import { RefineCardList } from "./RefineCardList";

/**
 * PROPS DEFINITION
 */
type Props = {
  initialPrices: Partial<Record<TierKey, Partial<TierPrice>>>;
};

/**
 * REFINE CALCULATOR CLIENT (MAIN SHELL)
 *
 * This is the primary container for the Refining feature.
 *
 * ARCHITECTURE:
 * - Orchestrates Global State (Zustand)
 * - Orchestrates Data Fetching (TanStack Query via useRefinePrices hook)
 * - Composes specialized sub-components (Header, Controls, CardList)
 *
 * BEST PRACTICES:
 * - Code Splitting: UI is divided into atomic, manageable files.
 * - Single Responsibility: Each sub-component handles one aspect of the UI.
 * - DRY: Centralized price sync logic in a custom hook.
 */
export default function RefineCalculatorClient({ initialPrices }: Props) {
  // Global Store Access
  const hydratePrices = useRefineStore((state) => state.hydratePrices);
  const resourceType = useRefineStore((state) => state.resourceType);
  const buyOrderCity = useRefineStore((state) => state.buyOrderCity);
  const sellOrderCity = useRefineStore((state) => state.sellOrderCity);
  const server = useRefineStore((state) => state.server);

  // 1. Initial Hydration: Load server-side data into client state
  useEffect(() => {
    if (initialPrices) {
      hydratePrices(initialPrices);
    }
  }, [hydratePrices, initialPrices]);

  // 2. Continuous Synchronization: Hook manages the API lifecycle
  useRefinePrices(resourceType, buyOrderCity, sellOrderCity, server);

  return (
    <div className="space-y-6 md:space-y-10 px-4 md:px-0 pb-16" translate="no">
      {/* CONTROL CENTER */}
      <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border-black/5 dark:border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
        <RefineHeader />
        <RefineControls />
      </div>

      {/* PROFIT ANALYSIS GRID */}
      <RefineCardList />
    </div>
  );
}
