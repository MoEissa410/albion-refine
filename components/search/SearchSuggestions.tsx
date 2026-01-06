"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { AlbionItem } from "@/lib/types";
import { ItemIcon } from "@/components/shared/ItemIcon";

/**
 * SEARCH FEATURE: SUGGESTIONS DROPDOWN
 *
 * Renders the list of matching items in a premium glass-morphism dropdown.
 */

interface SearchSuggestionsProps {
  suggestions: AlbionItem[];
  selectedIndex: number;
  onItemSelect: () => void;
}

export function SearchSuggestions({
  suggestions,
  selectedIndex,
  onItemSelect,
}: SearchSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 5, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full left-0 w-full glass rounded-[2rem] mt-3 overflow-hidden shadow-2xl border border-white/20 z-50 backdrop-blur-2xl"
    >
      <ul className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-primary/20">
        {suggestions.map((item, index) => {
          const isSelected = index === selectedIndex;
          const href = `/search?q=${encodeURIComponent(item.UniqueName)}`;

          return (
            <li key={item.UniqueName} className="mb-1 last:mb-0">
              <Link
                href={href}
                onClick={onItemSelect}
                className={`w-full text-foreground text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-4 group ${
                  isSelected
                    ? "bg-primary/20 text-primary scale-[1.02]"
                    : "hover:bg-primary/10 dark:hover:bg-primary/20"
                }`}
              >
                {/* Standardized Icon */}
                <ItemIcon
                  itemId={item.UniqueName}
                  size="md"
                  className="border-black/5 dark:border-white/10"
                  autoAnimate
                />

                {/* Labeling */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                    {item.LocalizedNames?.["EN-US"] || item.UniqueName}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5 truncate opacity-70">
                    {item.UniqueName}
                  </p>
                </div>

                {/* Status Indicator */}
                <ChevronRight
                  className={`w-4 h-4 transition-all opacity-40 group-hover:opacity-100 ${
                    isSelected ? "translate-x-0" : "-translate-x-2"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
