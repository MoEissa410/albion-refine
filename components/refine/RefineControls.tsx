"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResourceType, useRefineStore } from "@/hooks/use-refine-store";
import { ALBION_CITIES } from "@/lib/prices";
import { getCityStyle } from "@/lib/city-utils";
import { getResourceStyle } from "@/lib/resource-utils";

/**
 * CONFIGURATION CONSTANTS
 */
const RESOURCE_TYPES: {
  id: ResourceType;
  label: string;
}[] = [
  { id: "WOOD", label: "Wood / Planks" },
  { id: "ORE", label: "Ore / Bars" },
  { id: "FIBER", label: "Fiber / Cloth" },
  { id: "HIDE", label: "Hide / Leather" },
  { id: "STONE", label: "Stone / Blocks" },
];

const TAX_PRESETS = [
  { value: 4, label: "4% P" },
  { value: 6.5, label: "6.5% P" },
  { value: 9, label: "9% P" },
  { value: 13, label: "13% No P" },
] as const;

/**
 * REFINE CONTROLS COMPONENT
 *
 * The main input panel for the refining calculator.
 * Allows users to tweak global variables like tax rates, return rates,
 * and trading cities.
 */
export function RefineControls() {
  // Global Store Subscriptions
  const resourceType = useRefineStore((state) => state.resourceType);
  const returnRate = useRefineStore((state) => state.returnRate);
  const taxRate = useRefineStore((state) => state.taxRate);
  const shopFee = useRefineStore((state) => state.shopFee);
  const quantity = useRefineStore((state) => state.quantity);
  const buyOrderCity = useRefineStore((state) => state.buyOrderCity);
  const sellOrderCity = useRefineStore((state) => state.sellOrderCity);

  // Global Store Actions
  const setResourceType = useRefineStore((state) => state.setResourceType);
  const setReturnRate = useRefineStore((state) => state.setReturnRate);
  const setTaxRate = useRefineStore((state) => state.setTaxRate);
  const setShopFee = useRefineStore((state) => state.setShopFee);
  const setQuantity = useRefineStore((state) => state.setQuantity);
  const setBuyOrderCity = useRefineStore((state) => state.setBuyOrderCity);
  const setSellOrderCity = useRefineStore((state) => state.setSellOrderCity);

  const resStyle = getResourceStyle(resourceType);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-5 md:gap-7">
      {/* 1. RESOURCE TYPE */}
      <div className="space-y-2.5">
        <Label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${resStyle.bg}`} />
          Resource Type
        </Label>
        <Select
          value={resourceType}
          onValueChange={(v) => setResourceType(v as ResourceType)}
        >
          <SelectTrigger
            className={`glass-input bg-background h-12 rounded-2xl border-none shadow-sm hover:ring-2 ring-primary/20 transition-all font-black ${resStyle.text}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl overflow-hidden p-1">
            {RESOURCE_TYPES.map((option) => {
              const optStyle = getResourceStyle(option.id);
              return (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  className={`rounded-xl font-bold focus:bg-primary/10 transition-colors py-2.5 ${optStyle.text}`}
                >
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* 2. TAX RATE */}
      <div className="space-y-2.5">
        <Label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500/40" />
          Tax (%)
        </Label>
        <Select
          value={String(taxRate)}
          onValueChange={(v) => setTaxRate(Number(v))}
        >
          <SelectTrigger className="glass-input bg-background h-12 rounded-2xl border-none shadow-sm font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl p-1">
            {TAX_PRESETS.map((option) => (
              <SelectItem
                key={option.value}
                value={String(option.value)}
                className="rounded-xl font-bold py-2.5"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. SHOP FEE */}
      <div className="space-y-2.5">
        <Label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
          Shop Fee / 100
        </Label>
        <Input
          type="number"
          value={shopFee}
          onChange={(e) => setShopFee(Number(e.target.value) || 0)}
          className="glass-input bg-background h-12 rounded-2xl border-none shadow-sm font-extrabold text-lg focus-visible:ring-primary/30"
        />
      </div>

      {/* 4. RETURN RATE */}
      <div className="space-y-2.5">
        <Label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500/40" />
          Return Rate (%)
        </Label>
        <Input
          type="number"
          value={returnRate}
          onChange={(e) => setReturnRate(Number(e.target.value) || 0)}
          className="glass-input bg-background h-12 rounded-2xl border-none shadow-sm font-extrabold text-lg"
        />
      </div>

      {/* 5. QUANTITY */}
      <div className="space-y-2.5">
        <Label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500/40" />
          Quantity
        </Label>
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value) || 1))
          }
          className="glass-input bg-background h-12 rounded-2xl border-none shadow-sm font-extrabold text-lg"
        />
      </div>

      {/* 6. TRADING ROUTE (CITIES) */}
      <div className="space-y-2.5 sm:col-span-2 lg:col-span-1 xl:col-span-1">
        <Label className="text-[11px] uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
          Trading Route
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {/* BUY CITY */}
          <Select value={buyOrderCity} onValueChange={setBuyOrderCity}>
            <SelectTrigger
              className={`glass-input bg-background h-12 rounded-2xl border-none shadow-sm font-black text-xs px-2 ${
                getCityStyle(buyOrderCity).text
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl p-1">
              {ALBION_CITIES.map((city) => (
                <SelectItem
                  key={city}
                  value={city}
                  className={`rounded-xl font-bold py-2 ${
                    getCityStyle(city).text
                  }`}
                >
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* SELL CITY */}
          <Select value={sellOrderCity} onValueChange={setSellOrderCity}>
            <SelectTrigger
              className={`glass-input bg-background h-12 rounded-2xl border-none shadow-sm font-black text-xs px-2 ${
                getCityStyle(sellOrderCity).text
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl p-1">
              {ALBION_CITIES.map((city) => (
                <SelectItem
                  key={city}
                  value={city}
                  className={`rounded-xl font-bold py-2 ${
                    getCityStyle(city).text
                  }`}
                >
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
