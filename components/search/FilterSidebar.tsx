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
import { getCityStyle } from "@/lib/city-utils";
import { getQualityStyle } from "@/lib/quality-utils";

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
  hideEnchantAndQuality?: boolean;
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
  hideEnchantAndQuality = false,
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

            {/* ENCHANTMENT FILTER - Hidden if requested */}
            {!hideEnchantAndQuality && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Enchant
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
            )}
          </div>

          {/* City Selection Grid */}
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">
              Cities
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-2 gap-1.5">
              {ALBION_CITIES.map((city) => {
                const style = getCityStyle(city);
                const isSelected = selectedCities.includes(city);

                return (
                  <button
                    key={city}
                    onClick={() =>
                      setSelectedCities((prev) =>
                        prev.includes(city)
                          ? prev.filter((c) => c !== city)
                          : [...prev, city]
                      )
                    }
                    className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? `${style.bg} ${style.border} ${style.text} shadow-sm ring-1 ring-inset ring-opacity-50`
                        : "border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100"
                    }`}
                    style={isSelected ? { borderColor: "currentColor" } : {}}
                  >
                    <span className="relative z-10">{city}</span>
                    {isSelected && (
                      <div
                        className={`absolute inset-0 opacity-20 ${style.bg}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUALITY FILTER - Hidden if requested */}
          {!hideEnchantAndQuality && (
            <div>
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">
                Quality
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                {ALBION_QUALITIES.map((q) => {
                  const style = getQualityStyle(q.id);
                  const isSelected = selectedQualities.includes(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() =>
                        setSelectedQualities((prev) =>
                          prev.includes(q.id)
                            ? prev.filter((v) => v !== q.id)
                            : [...prev, q.id]
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold transition-all border flex justify-between items-center cursor-pointer group relative overflow-hidden ${
                        isSelected
                          ? `${style.bg} ${style.border} ${
                              style.text
                            } shadow-sm ring-1 ring-inset ${
                              style.ring || "ring-primary"
                            }`
                          : `border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 hover:border-black/10 dark:hover:border-white/10 opacity-70 hover:opacity-100`
                      }`}
                    >
                      <span className="relative z-10">{q.name}</span>
                      {isSelected && (
                        <div
                          className={`w-1.5 h-1.5 shrink-0 rounded-full ${style.text.replace(
                            "text-",
                            "bg-"
                          )} relative z-10`}
                        />
                      )}
                      {isSelected && (
                        <div
                          className={`absolute inset-0 opacity-20 ${style.bg}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
