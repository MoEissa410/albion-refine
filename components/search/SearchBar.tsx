"use client";

/**
 * LIVE SEARCH BAR COMPONENT
 *
 * PERFORMANCE STRATEGY:
 * 1. Hybrid Storage: Uses IndexedDB to store the static 17MB item database once.
 * 2. Instant Local Search: All suggestions are calculated in the browser (0ms network latency).
 * 3. Minified Payloads: Communicates with a specialized API route to minimize data transfer.
 */

import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlbionItem } from "@/lib/types";
import { getItemIcon, searchItems } from "@/lib/search";
import { useRouter } from "next/navigation";
import { getDBItem, setDBItem } from "@/lib/db";

// Key for our persistent browser database
const ITEMS_STORE_KEY = "albion_items_data";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AlbionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [itemsList, setItemsList] = useState<AlbionItem[] | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * INITIAL HYDRATION
   * Loads the item database from IndexedDB on startup.
   * If the user is new, it downloads the database from the server API once.
   */
  useEffect(() => {
    const loadItems = async () => {
      try {
        // Step 1: Check local persistent storage (IndexedDB)
        const cachedData = await getDBItem<AlbionItem[]>(ITEMS_STORE_KEY);

        if (cachedData && cachedData.length > 0) {
          setItemsList(cachedData);
          return;
        }

        // Step 2: Fallback to one-time network download if cache is empty
        setIsLoading(true);
        const res = await fetch("/api/items");
        const data = await res.json();

        if (Array.isArray(data)) {
          setItemsList(data);
          // Step 3: Save to IndexedDB for all future sessions
          await setDBItem(ITEMS_STORE_KEY, data);
        }
      } catch (err) {
        console.error("Critical: Failed to sync Albion database.", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  /**
   * SEARCH ENGINE (Client-Side)
   * Responsively filters the itemsList based on the user's typing.
   */
  useEffect(() => {
    if (query.length < 2 || !itemsList) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    // High performance: Filters thousands of items in <1ms locally.
    const results = searchItems(itemsList, query);
    setSuggestions(results);
    setSelectedIndex(-1);
  }, [query, itemsList]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
    setQuery("");
    setSuggestions([]);
  };

  const handleSearchAndNavigate = (itemId: string) => {
    setIsOpen(false);
    if (!itemId.trim()) return;
    router.push(`/search?q=${encodeURIComponent(itemId)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSearchAndNavigate(suggestions[selectedIndex].UniqueName);
      } else {
        handleSearchAndNavigate(query);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-50">
      <div className="relative group">
        <button
          type="button"
          onClick={() => handleSearchAndNavigate(query)}
          className="absolute left-5 top-1/2 -translate-y-1/2 group/icon z-10 p-1 transition-transform hover:scale-110 active:scale-95"
        >
          <SearchIcon className="w-5 h-5 text-muted-foreground group-focus-within:text-primary group-hover/icon:text-primary transition-colors cursor-pointer" />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={
            isLoading
              ? "Syncing Database..."
              : "Search items (e.g. Bag, Sword, T4 Ore)"
          }
          className="w-full bg-white/10 dark:bg-black/40 border border-white/20 dark:border-white/10 px-14 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 backdrop-blur-xl transition-all text-lg shadow-2xl placeholder:text-muted-foreground/50"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Spinner className="text-primary" />}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestion Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 w-full glass rounded-3xl mt-2 overflow-hidden shadow-2xl border border-white/10"
          >
            <ul className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/20">
              {suggestions.map((item, index) => {
                const isSelected = index === selectedIndex;
                const href = `/search?q=${encodeURIComponent(item.UniqueName)}`;

                return (
                  <li key={item.UniqueName} className="mb-1 last:mb-0">
                    <Link
                      href={href}
                      onClick={handleLinkClick}
                      className={`w-full text-left px-4 py-2.5 rounded-2xl transition-all flex items-center gap-4 group ${
                        isSelected
                          ? "bg-primary/20 text-primary scale-[1.01]"
                          : "hover:bg-primary/10 dark:hover:bg-primary/20"
                      }`}
                    >
                      <div className="shrink-0 w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center p-1 border border-black/5 dark:border-white/10">
                        <img
                          src={getItemIcon(item.UniqueName)}
                          alt=""
                          className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {item.LocalizedNames?.["EN-US"] || item.UniqueName}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 truncate opacity-60">
                          {item.UniqueName}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-all ${
                          isSelected
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-2"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
