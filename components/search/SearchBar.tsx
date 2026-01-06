"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { searchItems } from "@/lib/search";
import { useAlbionDB } from "@/hooks/use-albion-db";
import { SearchSuggestions } from "./SearchSuggestions";
import { AlbionItem } from "@/lib/types";

/**
 * SEARCH FEATURE: MAIN SEARCH BAR
 *
 * Performance Optimized Search with Hybrid Caching.
 *
 * BEST PRACTICES:
 * - Uses custom hook (useAlbionDB) for infrastructure logic.
 * - Atomic component (SearchSuggestions) for the list view.
 * - Local keyboard navigation support.
 */
export default function SearchBar() {
  // --- STATE ---
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AlbionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // --- REFS & HOOKS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { itemsList, isLoading } = useAlbionDB();

  // --- SEARCH LOGIC (Local filtering) ---
  useEffect(() => {
    if (query.length < 2 || !itemsList) {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    // High performance local filtering (calculates in <1ms)
    const results = searchItems(itemsList, query);
    setSuggestions(results);
    setSelectedIndex(-1);
  }, [query, itemsList]);

  // --- INTERACTION HANDLERS ---
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

  const handleNavigate = (itemIdOrQuery: string) => {
    setIsOpen(false);
    if (!itemIdOrQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(itemIdOrQuery)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleNavigate(suggestions[selectedIndex].UniqueName);
        } else {
          handleNavigate(query);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-50">
      {/* INPUT CONTAINER */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => handleNavigate(query)}
          className="absolute left-6 top-1/2 -translate-y-1/2 group/icon z-10 p-1 transition-transform hover:scale-110 active:scale-95"
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
              : "Search items (e.g. Bag, T4 Ore)"
          }
          className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 px-14 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40 backdrop-blur-xl transition-all text-lg shadow-2xl placeholder:text-muted-foreground/40 text-foreground"
        />

        {/* STATUS & ACTIONS */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Spinner className="text-primary w-5 h-5" />}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors group/x"
            >
              <X className="w-4 h-4 text-muted-foreground group-hover/x:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* SUGGESTIONS PORTAL */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <SearchSuggestions
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            onItemSelect={() => {
              setIsOpen(false);
              setQuery("");
              setSuggestions([]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
