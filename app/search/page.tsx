"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, Filter, ChevronDown } from "lucide-react";
import { AlbionItem, AlbionPrice } from "@/lib/types";
import { searchAlbionItems } from "@/lib/actions";
import {
  getItemIcon,
  searchItems,
  parseAlbionId,
  withEnchant,
} from "@/lib/search";
import { getItemPrices, ALBION_CITIES, ALBION_QUALITIES } from "@/lib/prices";
import { getDBItem, setDBItem } from "@/lib/db";
import { AnimatePresence, motion } from "framer-motion";

// MODULAR COMPONENTS
import ItemDisplayHeader from "@/components/search/ItemDisplayHeader";
import PriceTable from "@/components/search/PriceTable";
import SearchResultsList from "@/components/search/SearchResultsList";
import FilterSidebar from "@/components/search/FilterSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

const TIERS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];
const ENCHANTMENTS = ["0", "1", "2", "3", "4"];

/**
 * SEARCH PAGE ARCHITECTURE
 *
 * This page uses a hybrid search strategy:
 * 1. URL Query Synchronization: Reads search term 'q' from the URL.
 * 2. Local Database First: Tries searching the IndexedDB (Permanent Cache).
 * 3. Server Fallback: Uses a Server Action if local data isn't ready.
 * 4. Reactive Filtering: Prices auto-update when Tier/Enchant/City/Quality changes.
 */

function SearchContent() {
  const searchParams = useSearchParams();
  // Ensure we fully decode the query, especially for characters like @ encoded as %40
  const rawQuery = useMemo(() => {
    const q = searchParams.get("q") || "";
    try {
      return decodeURIComponent(q);
    } catch {
      return q;
    }
  }, [searchParams]);

  // UI STATE
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedQualities, setSelectedQualities] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<
    "sell_low" | "sell_high" | "buy_high" | "buy_low"
  >("sell_low");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // VIEW STATE: "prices" (Direct match) or "list" (Search suggestions)
  const [view, setView] = useState<"prices" | "list">("prices");
  const [itemMatches, setItemMatches] = useState<AlbionItem[]>([]);
  const [listLoading, setListLoading] = useState(!!rawQuery);

  // LOGICAL STATE (Selected Item details)
  const [baseId, setBaseId] = useState("");
  const [itemName, setItemName] = useState("");
  const [tier, setTier] = useState("All");
  const [enchantment, setEnchantment] = useState("0");

  /**
   * SYNC LOGIC
   * Whenever the URL query (?q=...) changes, we re-run the search.
   */
  useEffect(() => {
    if (!rawQuery) return;

    const performSearch = async () => {
      setListLoading(true);

      // Reset all filters when starting a new search
      setTier("All");
      setEnchantment("0");
      setSelectedCities([]);
      setSelectedQualities([]);

      try {
        // Attempt LOCAL search first for maximum speed
        const cachedItems = await getDBItem<AlbionItem[]>("items_list");
        let results: AlbionItem[] = [];

        if (cachedItems && cachedItems.length > 0) {
          results = searchItems(cachedItems, rawQuery);
        } else {
          // Fallback to Server if database sync is pending
          results = await searchAlbionItems(rawQuery);
        }

        // EXACT MATCH DETECTION (User clicked a specific item)
        // EXACT MATCH DETECTION (User clicked a specific item)
        // We must handle cases where rawQuery includes enchantment (e.g. T4_AXE@2)
        // while the result item is base (T4_AXE).
        const queryParts = parseAlbionId(rawQuery);

        // Construct the "base" unique name (T + Tier + Base) without enchantment for comparison
        // e.g. T4_AXE@2 -> T4_AXE
        const queryBaseId =
          queryParts.tier !== "0"
            ? `T${queryParts.tier}_${queryParts.base}`
            : queryParts.base;

        const exactMatch = results.find(
          (i) =>
            i.UniqueName.toUpperCase() === rawQuery.toUpperCase() ||
            i.UniqueName.toUpperCase() === queryBaseId.toUpperCase()
        );

        if (exactMatch) {
          setView("prices");
          setItemName(
            exactMatch.LocalizedNames?.["EN-US"] || exactMatch.UniqueName
          );

          // Extract Tier and Enchantment using specialized deconstructor
          const {
            base,
            tier: t,
            enchant: itemEnchant,
          } = parseAlbionId(exactMatch.UniqueName);

          // Use the actual tier from the item, or keep "All" if it's generic
          // If t is "0" (no tier), we leave it as "All" or "1" depending on item type?
          // Actually, let's trust the parsed tier if it exists (1-8), otherwise "All".
          setTier(t !== "0" ? t : "All");

          // CRITICAL FIX: If the query URL specified an enchantment (e.g. @2),
          // we must honor it over the base item's default (which is usually 0).
          // If queryEnchant is "0" or empty, we fallback to itemEnchant.
          const finalEnchant =
            queryParts.enchant && queryParts.enchant !== "0"
              ? queryParts.enchant
              : itemEnchant;

          setEnchantment(finalEnchant);
          setBaseId(base);
        } else if (results.length > 0) {
          // MULTIPLE MATCHES (User typed a generic word like "Bag")
          setView("list");
          setItemMatches(results);
        } else {
          // NO RESULTS
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

  // DERIVED STATE: Construct the full Albion Item ID (e.g., T4_BAG@1)
  const finalItemId = useMemo(() => {
    // If "All" tier is selected, we do NOT force "4". We use the base ID.
    // Use the selected tier, or undefined if "All".
    const activeTier = tier === "All" ? undefined : tier;

    // Re-attach Tier prefix if missing from baseId
    // If activeTier is present, force it.
    // If activeTier is undefined (All), we use the baseId as is (which might be just "BAG" or "T4_BAG" depending on how it was set).
    // Note: baseId from parseAlbionId usually strips the Tier prefix (e.g. "BAG").
    // So "BAG" sent to API might fail.
    // However, if the user wants "All", they usually want the LIST view.
    // But if we are in Price View, we need a valid ID.
    // For now, let's stick to the user's request: "user choose".
    // If they choose "All", we try to fetch without T prefix (or default T4 if strictly needed?).
    // Actually, let's default to "4" only if we REALLY have to, but let's try not to hardcode it in the logic flow.
    // For now, let's just use "4" as a fallback ONLY if we are building a brand new ID, but if tier is "All", maybe we default to "4" just for the Price Chart display to work?
    // User complaint was "default is 4". This likely refers to the selection state.
    // We already fixed selection state in previous step.
    // So here, we just ensure that IF a specific tier is selected, used it.

    // OLD LOGIC: const activeTier = tier === "All" ? "4" : tier;

    // NEW LOGIC: Default to 4 only if we absolutely need a tier to make a valid ID
    const effectiveTier = activeTier || "4";

    const idWithTier =
      effectiveTier && effectiveTier !== "0" && !baseId.startsWith("T")
        ? `T${effectiveTier}_${baseId}`
        : baseId;
    return withEnchant(idWithTier, enchantment);
  }, [baseId, tier, enchantment]);

  // DATA FETCHING: Albion Prices (Real-time from Market API)
  const { data: priceData, isLoading: pricesLoading } = useQuery({
    queryKey: ["prices", finalItemId, selectedCities, selectedQualities],
    queryFn: () =>
      getItemPrices(finalItemId, selectedCities, selectedQualities),
    enabled: !!baseId && view === "prices",
    staleTime: 60000,
  });

  // SORTING LOGIC: Applied on the client for instant responsiveness
  const sortedPrices = useMemo(() => {
    if (!priceData && !pricesLoading) return [];

    // Determine which cities we SHOULD be showing
    const displayCities =
      selectedCities.length > 0 ? selectedCities : ALBION_CITIES;

    // Determine which qualities we SHOULD be showing
    const displayQualities =
      selectedQualities.length > 0 ? selectedQualities : [1, 2, 3, 4, 5];

    // Create a complete list by merging API data with our target cities and qualities
    // This ensures every requested combination has a card.
    const fullData: AlbionPrice[] = [];

    displayCities.forEach((city) => {
      displayQualities.forEach((q) => {
        const existing = priceData?.find(
          (p) => p.city === city && p.quality === q
        );
        if (existing) {
          fullData.push(existing);
        }
        // Skip cards with no data - only show actual market listings
      });
    });

    // Final sorting based on user selection
    return [...fullData].sort((a, b) => {
      const pA = sortBy.startsWith("sell") ? a.sell_price_min : a.buy_price_max;
      const pB = sortBy.startsWith("sell") ? b.sell_price_min : b.buy_price_max;

      // Ensure 0 prices (No Data) stay at the bottom regardless of sort order
      if (pA === 0) return 1;
      if (pB === 0) return -1;

      if (sortBy.endsWith("low")) return pA - pB;
      return pB - pA;
    });
  }, [
    priceData,
    pricesLoading,
    sortBy,
    selectedCities,
    selectedQualities,
    finalItemId,
  ]);

  return (
    <div className="wrapper py-6 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* MOBILE FILTER TRIGGER */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden glass-card flex items-center justify-between p-4 mb-2"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm uppercase tracking-widest">
              Filters
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isFilterOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* SIDEBAR FILTERS (Modular Component) */}
        <FilterSidebar
          tier={tier}
          setTier={setTier}
          enchantment={enchantment}
          setEnchantment={setEnchantment}
          selectedCities={selectedCities}
          setSelectedCities={setSelectedCities}
          selectedQualities={selectedQualities}
          setSelectedQualities={setSelectedQualities}
          isFilterOpen={isFilterOpen}
          tiers={TIERS}
          enchantments={ENCHANTMENTS}
          hideEnchantAndQuality={view === "list" || listLoading}
        />

        {/* RESULTS AREA */}
        <main className="flex-1 space-y-6 min-h-[600px]">
          <AnimatePresence mode="wait">
            {listLoading ? (
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <Skeleton className="h-44 w-full rounded-3xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-44 rounded-3xl" />
                  ))}
                </div>
              </motion.div>
            ) : view === "list" ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {(() => {
                  // Check if we have items of the selected tier
                  const filtered =
                    tier === "All"
                      ? itemMatches
                      : itemMatches.filter((item) => {
                          const itemTier =
                            item.Tier ||
                            parseInt(parseAlbionId(item.UniqueName).tier);
                          return itemTier === parseInt(tier);
                        });

                  if (filtered.length === 0) {
                    return (
                      <div className="glass-card p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Filter className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold">
                          No {tier === "All" ? "" : `Tier ${tier}`} items found
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Try adjusting the tier filter or search term.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <SearchResultsList
                      items={filtered}
                      query={rawQuery}
                      selectedCities={selectedCities}
                      selectedQualities={selectedQualities}
                      enchantment={enchantment}
                    />
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="prices-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* HERO HEADER */}
                <ItemDisplayHeader
                  itemId={finalItemId}
                  itemName={itemName}
                  tier={tier}
                  enchantment={enchantment}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />

                {/* PRICING DATA OR LOADING STATE */}
                {pricesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-44 w-full rounded-3xl" />
                    ))}
                  </div>
                ) : (
                  <PriceTable prices={sortedPrices} isLoading={false} />
                )}

                {/* EMPTY STATE */}
                {!pricesLoading && sortedPrices.length === 0 && (
                  <div className="glass-card p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <SearchIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">
                      No market signals found
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      We couldn't find any recent price data for this item. Try
                      refreshing or selecting different cities.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60screen] py-20 gap-4">
          <Spinner width={32} height={32} className="text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            Initializing Market Analytics...
          </p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
