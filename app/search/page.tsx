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

const TIERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
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
  const rawQuery = searchParams.get("q") || "";

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
  const [listLoading, setListLoading] = useState(false);

  // LOGICAL STATE (Selected Item details)
  const [baseId, setBaseId] = useState("");
  const [itemName, setItemName] = useState("");
  const [tier, setTier] = useState("4");
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
      setTier("4");
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
        const exactMatch = results.find(
          (i) => i.UniqueName.toUpperCase() === rawQuery.toUpperCase()
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
            enchant: e,
          } = parseAlbionId(exactMatch.UniqueName);

          setTier(t === "0" ? "1" : t);
          setEnchantment(e);
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
    // Re-attach Tier prefix if missing from baseId
    const idWithTier =
      tier && tier !== "0" && !baseId.startsWith("T")
        ? `T${tier}_${baseId}`
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
                  const hasSelectedTier = itemMatches.some(
                    (item) => item.Tier === parseInt(tier)
                  );

                  // If no items match the current tier, show all items instead
                  const filtered = hasSelectedTier
                    ? itemMatches.filter((item) => item.Tier === parseInt(tier))
                    : itemMatches;

                  if (filtered.length === 0) {
                    return (
                      <div className="glass-card p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <Filter className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold">No items found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Try a different search term.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <SearchResultsList items={filtered} query={rawQuery} />
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
