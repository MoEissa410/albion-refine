/**
 * Search State Hook
 *
 * This implementation consolidates the core search logic from page.tsx into a custom hook.
 * This separates the Data Fetching logic (Model) from the View logic (View).
 *
 * Best Practice: "Separation of Concerns" & "Custom Hooks for Complex Logic"
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { searchAlbionItems } from "@/lib/actions";
import { getDBItem } from "@/lib/db";
import { searchItems, parseAlbionId, withEnchant } from "@/lib/search";
import type { AlbionItem } from "@/lib/types";

import { getItemPrices, AlbionPrice, ALBION_CITIES } from "@/lib/prices";

export function useSearchState() {
  const searchParams = useSearchParams();

  // 1. QUERY MANAGEMENT: Ensure clean, decoded query string from URL
  const rawQuery = useMemo(() => {
    const q = searchParams.get("q") || "";
    try {
      return decodeURIComponent(q);
    } catch {
      return q;
    }
  }, [searchParams]);

  // 2. UI STATE: Filters and Sorting
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedQualities, setSelectedQualities] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<
    "sell_low" | "sell_high" | "buy_high" | "buy_low"
  >("sell_low");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 3. SEARCH VIEW STATE
  const [view, setView] = useState<"prices" | "list">("prices");
  const [itemMatches, setItemMatches] = useState<AlbionItem[]>([]);
  const [listLoading, setListLoading] = useState(!!rawQuery);

  // 4. SELECTED ITEM STATE
  const [baseId, setBaseId] = useState("");
  const [itemName, setItemName] = useState("");
  const [tier, setTier] = useState("All");
  const [enchantment, setEnchantment] = useState("0");

  /**
   * Main Search Effect
   * Runs whenever the URL query changes. Handles caching, exact matches, and server fallback.
   */
  useEffect(() => {
    if (!rawQuery) return;

    const performSearch = async () => {
      setListLoading(true);

      // Default Filters Reset
      setTier("All");
      setEnchantment("0");
      setSelectedCities([]);
      setSelectedQualities([]);

      try {
        // Step A: Check Local DB (IndexedDB) for instant offline-first results
        const cachedItems = await getDBItem<AlbionItem[]>("albion_items_data");
        let results: AlbionItem[] = [];

        if (cachedItems && cachedItems.length > 0) {
          results = searchItems(cachedItems, rawQuery);
        } else {
          // Step B: Server Action Fallback
          results = await searchAlbionItems(rawQuery);
        }

        // Step C: Exact Match Detection
        const queryParts = parseAlbionId(rawQuery);
        // Compare against base ID to support searching "T4_AXE@2" while item is "T4_AXE"
        const queryBaseId =
          queryParts.tier !== "0"
            ? `T${queryParts.tier}_${queryParts.base}`
            : queryParts.base;

        const exactMatch = results.find(
          (i) =>
            i.UniqueName.toUpperCase() === rawQuery.toUpperCase() ||
            i.UniqueName.toUpperCase() === queryBaseId.toUpperCase()
        );

        // Always populate match list for flexibility
        setItemMatches(results);

        if (exactMatch) {
          setView("prices");
          setItemName(
            exactMatch.LocalizedNames?.["EN-US"] || exactMatch.UniqueName
          );

          // Parse the FOUND item's details
          const {
            base,
            tier: t,
            enchant: itemEnchant,
          } = parseAlbionId(exactMatch.UniqueName);

          // Smart Defaults:
          // 1. Tier: If item has a tier, use it. If generic, use "All".
          setTier(t !== "0" ? t : "All");

          // 2. Enchantment: If URL asked for specific enchant, use it. Else use item's default.
          const finalEnchant =
            queryParts.enchant && queryParts.enchant !== "0"
              ? queryParts.enchant
              : itemEnchant;

          setEnchantment(finalEnchant);
          setBaseId(base);
        } else if (results.length > 0) {
          // No exact match, but we have candidates -> Show List
          setView("list");
        } else {
          // Zero valid results -> Show Empty Price View (No Data)
          setItemName(rawQuery);
          setBaseId(rawQuery);
          setView("prices");
        }
      } catch (err) {
        console.error("Search Logic Failure:", err);
      } finally {
        setListLoading(false);
      }
    };

    performSearch();
  }, [rawQuery]);

  // 5. CALCULATED ITEM ID
  const finalItemId = useMemo(() => {
    // If Filter is "All", treat as undefined active tier
    const activeTier = tier === "All" ? undefined : tier;

    // Default to T4 if we strictly need a prefix but have none,
    // otherwise use baseId (generic).
    const effectiveTier = activeTier || "4";

    const idWithTier =
      effectiveTier && effectiveTier !== "0" && !baseId.startsWith("T")
        ? `T${effectiveTier}_${baseId}`
        : baseId;

    return withEnchant(idWithTier, enchantment);
  }, [baseId, tier, enchantment]);

  // 6. PRICE DATA FETCHING (React Query)
  const { data: priceData, isLoading: pricesLoading } = useQuery({
    queryKey: ["prices", finalItemId, selectedCities, selectedQualities],
    queryFn: () =>
      getItemPrices(finalItemId, selectedCities, selectedQualities),
    enabled: !!baseId && view === "prices",
    staleTime: 60000,
  });

  // 7. SORTING & FILTERING
  const sortedPrices = useMemo(() => {
    if (!priceData && !pricesLoading) return [];

    const displayCities =
      selectedCities.length > 0 ? selectedCities : ALBION_CITIES;
    const displayQualities =
      selectedQualities.length > 0 ? selectedQualities : [1, 2, 3, 4, 5];

    const fullData: AlbionPrice[] = [];

    displayCities.forEach((city) => {
      displayQualities.forEach((q) => {
        const existing = priceData?.find(
          (p) => p.city === city && p.quality === q
        );
        if (existing) {
          fullData.push(existing);
        }
      });
    });

    return [...fullData].sort((a, b) => {
      const pA = sortBy.startsWith("sell") ? a.sell_price_min : a.buy_price_max;
      const pB = sortBy.startsWith("sell") ? b.sell_price_min : b.buy_price_max;
      if (pA === 0) return 1;
      if (pB === 0) return -1;
      if (sortBy.endsWith("low")) return pA - pB;
      return pB - pA;
    });
  }, [priceData, pricesLoading, sortBy, selectedCities, selectedQualities]);

  return {
    rawQuery,
    selectedCities,
    setSelectedCities,
    selectedQualities,
    setSelectedQualities,
    sortBy,
    setSortBy,
    isFilterOpen,
    setIsFilterOpen,
    view,
    setView,
    itemMatches,
    listLoading,
    baseId,
    itemName,
    tier,
    setTier,
    enchantment,
    setEnchantment,
    finalItemId,
    sortedPrices,
    pricesLoading,
  };
}
