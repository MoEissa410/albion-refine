"use client";

import React, { Suspense } from "react";
import { SearchIcon, Filter, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { parseAlbionId } from "@/lib/search";
import { useSearchState } from "@/hooks/use-search-state";

// MODULAR COMPONENTS
import ItemDisplayHeader from "@/components/search/ItemDisplayHeader";
import PriceTable from "@/components/search/PriceTable";
import SearchResultsList from "@/components/search/SearchResultsList";
import FilterSidebar from "@/components/search/FilterSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

const TIERS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];
const ENCHANTMENTS = ["0", "1", "2", "3", "4"];

function SearchContent() {
  const {
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
    itemMatches,
    listLoading,
    tier,
    setTier,
    enchantment,
    setEnchantment,
    finalItemId,
    sortedPrices,
    pricesLoading,
    itemName,
  } = useSearchState();

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
