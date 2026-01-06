import RefineCalculatorClient from "./RefineCalculatorClient";
import { TierKey, TierPrice } from "@/hooks/use-refine-store";
import { buildFullRefineIdMap } from "@/lib/refine-items";
import { getItemPrices } from "@/lib/prices";
import { ResourceType } from "@/hooks/use-refine-store";

/**
 * REFINE CALCULATOR (SERVER SIDE)
 *
 * This is the entry point for the Refining feature.
 * It handles the initial server-side data fetch so the user sees
 * real prices immediately upon page load (SSR).
 */

const DEFAULT_RESOURCE: ResourceType = "WOOD";

interface TierPriceWithTimestamp extends Partial<TierPrice> {
  buyTimestamp?: string;
  sellTimestamp?: string;
}

/**
 * seedPrices
 *
 * Pre-fetches market data from the Albion Online Data Project
 * during server-side rendering.
 */
const seedPrices = async (): Promise<
  Partial<Record<TierKey, TierPriceWithTimestamp>>
> => {
  const fullIdMap = buildFullRefineIdMap(DEFAULT_RESOURCE);

  // Extract all unique item IDs (both raw and refined) to fetch in one batch request
  const allIdsSet = new Set<string>();
  Object.values(fullIdMap).forEach((set) => {
    allIdsSet.add(set.raw);
    allIdsSet.add(set.refined);
  });
  const batchIds = Array.from(allIdsSet).join(",");

  let prices: Partial<Record<TierKey, TierPriceWithTimestamp>> = {};

  try {
    // API Call (Server-to-Server)
    const apiPrices = await getItemPrices(batchIds);

    // Aggregate prices by ID to find the best market signals
    const aggregated: Record<
      string,
      {
        bestBuy: number;
        bestSell: number;
        buyTimestamp: string;
        sellTimestamp: string;
      }
    > = {};

    for (const p of apiPrices) {
      if (!aggregated[p.item_id]) {
        aggregated[p.item_id] = {
          bestBuy: 0,
          bestSell: 0,
          buyTimestamp: "",
          sellTimestamp: "",
        };
      }
      const current = aggregated[p.item_id];

      // We look for max buy price and min sell price for safest profit estimates
      if (p.buy_price_max > current.bestBuy) {
        current.bestBuy = p.buy_price_max;
        current.buyTimestamp = p.buy_price_max_date;
      }
      if (
        p.sell_price_min > 0 &&
        (current.bestSell === 0 || p.sell_price_min < current.bestSell)
      ) {
        current.bestSell = p.sell_price_min;
        current.sellTimestamp = p.sell_price_min_date;
      }
    }

    // Map aggregated results back to the TierKey structure
    const next: Partial<Record<TierKey, TierPriceWithTimestamp>> = {};
    Object.entries(fullIdMap).forEach(([key, set]) => {
      const rawAgg = aggregated[set.raw];
      const refinedAgg = aggregated[set.refined];

      next[key as TierKey] = {
        buy: rawAgg?.bestBuy ?? 0,
        sell: refinedAgg?.bestSell ?? 0,
        buyTimestamp: rawAgg?.buyTimestamp ?? "",
        sellTimestamp: refinedAgg?.sellTimestamp ?? "",
      };
    });

    prices = next;
  } catch (error) {
    console.error("[SSR Price Fetch Error]:", error);
    prices = {};
  }

  return prices;
};

export default async function RefineCalculator() {
  // Pre-load data on the server
  const initialPrices = await seedPrices();

  // Pass to the interactive client component
  return <RefineCalculatorClient initialPrices={initialPrices} />;
}
