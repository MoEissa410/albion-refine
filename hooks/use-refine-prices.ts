"use client";

import { useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getItemPrices, AlbionPrice } from "@/lib/prices";
import { buildFullRefineIdMap, RefineItemIdSet } from "@/lib/refine-items";
import {
  ResourceType,
  TierKey,
  useRefineStore,
} from "@/hooks/use-refine-store";

/**
 * USE REFINE PRICES HOOK
 *
 * Orchestrates the fetching and synchronization of market prices for
 * the refining calculator.
 *
 * Features:
 * 1. Automatic ID mapping based on Resource Type.
 * 2. Optimized ID extraction for batch API requests.
 * 3. High-performance Map-based price assignment.
 * 4. Automatic Store hydration when prices change.
 */
export function useRefinePrices(
  resourceType: ResourceType,
  buyOrderCity: string,
  sellOrderCity: string
) {
  const hydratePrices = useRefineStore((state) => state.hydratePrices);

  // 1. Build the ID Map (Raw vs Refined IDs for every tier)
  const fullIdMap = useMemo(
    () => buildFullRefineIdMap(resourceType),
    [resourceType]
  );

  // 2. Flatten IDs for API batching
  const allIds = useMemo(() => {
    const ids = new Set<string>();
    (Object.values(fullIdMap) as RefineItemIdSet[]).forEach((set) => {
      ids.add(set.raw);
      ids.add(set.refined);
    });
    return Array.from(ids).join(",");
  }, [fullIdMap]);

  // 3. Automated API Fetching via TanStack Query
  const { data: livePrices, dataUpdatedAt } = useQuery({
    queryKey: ["refine_prices", resourceType, buyOrderCity, sellOrderCity],
    queryFn: async () => {
      const cities = Array.from(new Set([buyOrderCity, sellOrderCity]));
      const apiPrices = await getItemPrices(allIds, cities);

      const result: Record<
        TierKey,
        {
          buy: number;
          sell: number;
          buyTimestamp: string;
          sellTimestamp: string;
        }
      > = {} as any;

      // OPTIMIZATION: Create a reverse lookup map for O(1) assignment
      const idToKeys = new Map<
        string,
        { key: TierKey; type: "raw" | "refined" }[]
      >();
      (Object.entries(fullIdMap) as [TierKey, RefineItemIdSet][]).forEach(
        ([key, set]) => {
          if (!idToKeys.has(set.raw)) idToKeys.set(set.raw, []);
          idToKeys.get(set.raw)!.push({ key, type: "raw" });
          if (!idToKeys.has(set.refined)) idToKeys.set(set.refined, []);
          idToKeys.get(set.refined)!.push({ key, type: "refined" });
        }
      );

      apiPrices.forEach((p: AlbionPrice) => {
        const targets = idToKeys.get(p.item_id);
        if (!targets) return;

        targets.forEach(({ key, type }) => {
          if (!result[key]) {
            result[key] = {
              buy: 0,
              sell: 0,
              buyTimestamp: "",
              sellTimestamp: "",
            };
          }

          if (type === "raw" && p.city === buyOrderCity) {
            if (p.buy_price_max > result[key].buy) {
              result[key].buy = p.buy_price_max;
              result[key].buyTimestamp = p.buy_price_max_date;
            }
          } else if (type === "refined" && p.city === sellOrderCity) {
            if (p.sell_price_min > 0) {
              if (
                result[key].sell === 0 ||
                p.sell_price_min < result[key].sell
              ) {
                result[key].sell = p.sell_price_min;
                result[key].sellTimestamp = p.sell_price_min_date;
              }
            }
          }
        });
      });
      return result;
    },
    staleTime: 60000,
    enabled: !!allIds,
  });

  // 4. Sync Query Results to the Global Store
  const lastUpdateRef = useRef(0);
  useEffect(() => {
    if (livePrices && dataUpdatedAt && dataUpdatedAt > lastUpdateRef.current) {
      lastUpdateRef.current = dataUpdatedAt;
      hydratePrices(livePrices);
    }
  }, [dataUpdatedAt, livePrices, hydratePrices]);

  return { livePrices, dataUpdatedAt };
}
