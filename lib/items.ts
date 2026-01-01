/**
 * ALBION DATA MANAGEMENT SYSTEM
 *
 * This file handles the server-side retrieval and optimization of the massive
 * Albion item database (items.json).
 */

import { AlbionItem } from "./types";

// GLOBAL SINGLETON CACHE
let cachedItems: AlbionItem[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

/**
 * getAllItems
 *
 * Fetches the raw 17MB item dump from the community repository.
 */
export async function getAllItems(): Promise<AlbionItem[]> {
  const now = Date.now();

  // If we already have fresh items in memory, return them instantly
  if (cachedItems && now - lastFetchTime < CACHE_DURATION) {
    return cachedItems;
  }

  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json",
      {
        next: { revalidate: 60 * 60 * 24 }, // Next.js level caching
      }
    );

    if (!res.ok) throw new Error("Failed to fetch items from source");

    const rawItems: any[] = await res.json();

    /**
     * PROCESS & PURIFY
     * We transform the heavy object into a lightweight AlbionItem structure.
     */
    const processedItems: AlbionItem[] = rawItems
      .filter(
        (item) => item.UniqueName && !item.UniqueName.includes("QUESTITEM")
      )
      .map((item) => ({
        UniqueName: item.UniqueName,
        LocalizedNames: {
          "EN-US": item.LocalizedNames?.["EN-US"] || item.UniqueName,
        },
        Tier: item.Tier || 0,
      }));

    cachedItems = processedItems;
    lastFetchTime = now;

    console.log(
      `[Architecture] Optimized ${processedItems.length} items for in-memory caching.`
    );
    return processedItems;
  } catch (error) {
    console.error("Critical Failure: Could not load items database.", error);
    return cachedItems || []; // Return stale cache as fallback
  }
}

/**
 * Utility for quick filtering by Tier on the server if needed.
 */
export function filterItemsByTier(items: AlbionItem[], tier: number) {
  return items.filter((item) => item.Tier === tier);
}

export const ALBION_TIERS = [1, 2, 3, 4, 5, 6, 7, 8];
