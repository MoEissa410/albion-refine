"use client";

import React from "react";
import { Filter, Layers, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALBION_CITIES, ALBION_QUALITIES } from "@/lib/prices";

/**
 * FilterSidebar Component
 *
 * Handles all market filters including Tier, Enchantment, City, and Quality.
 * Uses a responsive grid that adapts for mobile and desktop sidebar views.
 */

interface FilterSidebarProps {
  tier: string;
  setTier: (v: string) => void;
  enchantment: string;
  setEnchantment: (v: string) => void;
  selectedCities: string[];
  setSelectedCities: React.Dispatch<React.SetStateAction<string[]>>;
  selectedQualities: number[];
  setSelectedQualities: React.Dispatch<React.SetStateAction<number[]>>;
  isFilterOpen: boolean;
  tiers: string[];
  enchantments: string[];
}

export default function FilterSidebar({
  tier,
  setTier,
  enchantment,
  setEnchantment,
  selectedCities,
  setSelectedCities,
  selectedQualities,
  setSelectedQualities,
  isFilterOpen,
  tiers,
  enchantments,
}: FilterSidebarProps) {
  return (
    <aside
      className={`w-full lg:w-64 space-y-6 ${
        isFilterOpen ? "block" : "hidden lg:block"
      }`}
    >
      <div className="glass-card p-5 border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
          <Filter className="w-4 h-4 text-primary" />
          <h2 className="font-bold uppercase tracking-widest text-xs">
            Market Filters
          </h2>
        </div>

        <div className="space-y-6">
          {/* Tier & Enchantment Group */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" /> Tier
              </label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="glass-input h-10 border-black/5 dark:border-white/5 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  {tiers.map((t) => (
                    <SelectItem key={t} value={t}>
                      Tier {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Enchant
              </label>
              <Select value={enchantment} onValueChange={setEnchantment}>
                <SelectTrigger className="glass-input h-10 border-black/5 dark:border-white/5 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass">
                  {enchantments.map((e) => (
                    <SelectItem key={e} value={e}>
                      .{e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* City Selection Grid */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">
              Cities
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-2 gap-1.5">
              {ALBION_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() =>
                    setSelectedCities((prev) =>
                      prev.includes(city)
                        ? prev.filter((c) => c !== city)
                        : [...prev, city]
                    )
                  }
                  className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-colors border cursor-pointer ${
                    selectedCities.includes(city)
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                      : "border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-primary/40"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Filter Grid */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">
              Quality
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {ALBION_QUALITIES.map((q) => (
                <button
                  key={q.id}
                  onClick={() =>
                    setSelectedQualities((prev) =>
                      prev.includes(q.id)
                        ? prev.filter((v) => v !== q.id)
                        : [...prev, q.id]
                    )
                  }
                  className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-colors border flex justify-between items-center cursor-pointer ${
                    selectedQualities.includes(q.id)
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-primary/20"
                  }`}
                >
                  <span className="truncate">{q.name}</span>
                  {selectedQualities.includes(q.id) && (
                    <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
