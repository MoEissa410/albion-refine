import { create } from "zustand";
import { REFINING_RECIPES } from "@/lib/formulas";
import { ALBION_CITIES } from "@/lib/prices";

export type ResourceType = "WOOD" | "ORE" | "FIBER" | "HIDE" | "STONE";
export type TierKey = `${number}.${number}`;

export interface TierPrice {
  buy: number;
  sell: number;
}

export interface CardMetrics {
  tier: number;
  enchant: number;
  profitPerUnit: number;
  totalProfit: number;
  costPerUnit: number;
  buyPrice: number;
  sellPrice: number;
  intermediatePrice: number;
  intermediateKey: TierKey | null;
  isReliable: boolean;
  hasMarketPrices: { buy: boolean; sell: boolean };
}

export const TIER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const ENCHANT_LEVELS = [0, 1, 2, 3, 4] as const;
export const buildTierKey = (tier: number, enchant: number): TierKey =>
  `${tier}.${enchant}`;

const createEmptyPrices = (): Record<TierKey, TierPrice> => {
  const next: Record<TierKey, TierPrice> = {} as Record<TierKey, TierPrice>;
  TIER_LEVELS.forEach((tier) =>
    ENCHANT_LEVELS.forEach((enchant) => {
      next[buildTierKey(tier, enchant)] = { buy: 0, sell: 0 };
    })
  );
  return next;
};

type PricePayload = Partial<Record<TierKey, Partial<TierPrice>>>;

interface RefineState {
  resourceType: ResourceType;
  returnRate: number;
  taxRate: number;
  shopFee: number;
  buyOrderCity: string;
  sellOrderCity: string;
  quantity: number;
  prices: Record<TierKey, TierPrice>;
  marketPrices: Record<TierKey, TierPrice>;
  priceTimestamps: Record<TierKey, { buy?: string; sell?: string }>;
  hydratePrices: (input: PricePayload) => void;
  setResourceType: (v: ResourceType) => void;
  setReturnRate: (v: number) => void;
  setTaxRate: (v: number) => void;
  setShopFee: (v: number) => void;
  setBuyOrderCity: (v: string) => void;
  setSellOrderCity: (v: string) => void;
  setQuantity: (v: number) => void;
  updatePrice: (key: TierKey, field: "buy" | "sell", value: number) => void;
}

// ================= STORE =================
export const useRefineStore = create<RefineState>((set) => ({
  resourceType: "WOOD",
  returnRate: 36.7,
  taxRate: 6.5,
  shopFee: 500,
  buyOrderCity: ALBION_CITIES[0],
  sellOrderCity: ALBION_CITIES[1] ?? ALBION_CITIES[0],
  quantity: 999,
  prices: createEmptyPrices(),
  marketPrices: createEmptyPrices(),
  priceTimestamps: {},
  hydratePrices: (input) =>
    set((state) => {
      const nextPrices = { ...state.prices };
      const nextMarketPrices = { ...state.marketPrices };
      const nextTimestamps = { ...state.priceTimestamps };
      Object.entries(input).forEach(([key, value]) => {
        if (!value) return;
        const k = key as TierKey;
        nextPrices[k] = {
          buy: value.buy ?? nextPrices[k].buy,
          sell: value.sell ?? nextPrices[k].sell,
        };
        nextMarketPrices[k] = {
          buy: value.buy ?? nextMarketPrices[k].buy,
          sell: value.sell ?? nextMarketPrices[k].sell,
        };
        const v = value as Partial<TierPrice> & {
          buyTimestamp?: string;
          sellTimestamp?: string;
        };
        if (v.buyTimestamp || v.sellTimestamp)
          nextTimestamps[k] = { buy: v.buyTimestamp, sell: v.sellTimestamp };
      });
      return {
        prices: nextPrices,
        marketPrices: nextMarketPrices,
        priceTimestamps: nextTimestamps,
      };
    }),
  setResourceType: (resourceType) => set({ resourceType }),
  setReturnRate: (returnRate) => set({ returnRate }),
  setTaxRate: (taxRate) => set({ taxRate }),
  setShopFee: (shopFee) => set({ shopFee }),
  setBuyOrderCity: (buyOrderCity) => set({ buyOrderCity }),
  setSellOrderCity: (sellOrderCity) => set({ sellOrderCity }),
  setQuantity: (quantity) => set({ quantity }),
  updatePrice: (key, field, value) =>
    set((state) => ({
      prices: {
        ...state.prices,
        [key]: { ...state.prices[key], [field]: Number(value) || 0 },
      },
    })),
}));

// ================= UTILITIES =================
const clampRate = (rate: number) => Math.min(Math.max(rate, 0), 100);
const getRecipe = (tier: number) =>
  REFINING_RECIPES[tier] ?? { tier, rawAmount: 1, refinedPrevAmount: 0 };
const TIER_NUTRITION: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 112,
  5: 224,
  6: 448,
  7: 896,
  8: 1792,
};

// ================= CALCULATION =================
let lastState: any = null;
let lastMetrics: Record<TierKey, CardMetrics> | null = null;

export const selectAllMetrics = (
  state: RefineState
): Record<TierKey, CardMetrics> => {
  if (state === lastState && lastMetrics) return lastMetrics;
  const metrics: Record<string, CardMetrics> = {};
  const tiers = [2, 3, 4, 5, 6, 7, 8];
  const enchantments = [0, 1, 2, 3, 4];
  const rr = clampRate(state.returnRate) / 100;
  const tax = clampRate(state.taxRate) / 100;

  tiers.forEach((tier) => {
    enchantments.forEach((enchant) => {
      if (tier < 4 && enchant > 0) return;
      const key = buildTierKey(tier, enchant);
      const recipe = getRecipe(tier);
      const sellPrice = state.prices[key]?.sell || 0;
      const rawPrice = state.prices[key]?.buy || 0;

      let prevRefPrice = 0;
      let prevReliable = true;
      let prevKey: TierKey | null = null;
      if (recipe.refinedPrevAmount > 0) {
        const prevEnchant = tier - 1 < 4 ? 0 : enchant;
        prevKey = buildTierKey(tier - 1, prevEnchant);
        prevRefPrice = state.prices[prevKey]?.sell || 0;
        if (prevRefPrice === 0) prevReliable = false;
      }

      const grossRawCost = recipe.rawAmount * rawPrice;
      const grossIntermediateCost = recipe.refinedPrevAmount * prevRefPrice;
      const totalGrossCost = grossRawCost + grossIntermediateCost;
      const effectiveMaterialCost = totalGrossCost * (1 - rr);

      const salesTax = sellPrice * tax;
      const nutrition = TIER_NUTRITION[tier] || 0;
      const usageFee = (nutrition * state.shopFee) / 20000;
      const profitPerUnit =
        sellPrice - salesTax - effectiveMaterialCost - usageFee;
      const costPerUnit = effectiveMaterialCost + salesTax + usageFee;

      metrics[key] = {
        tier,
        enchant,
        profitPerUnit,
        totalProfit: profitPerUnit * state.quantity,
        costPerUnit: Math.max(0, costPerUnit),
        buyPrice: rawPrice,
        sellPrice,
        intermediatePrice: prevRefPrice,
        intermediateKey: prevKey,
        isReliable: rawPrice > 0 && sellPrice > 0 && prevReliable,
        hasMarketPrices: {
          buy: rawPrice > 0,
          sell: sellPrice > 0,
        },
      };
    });
  });

  lastState = state;
  lastMetrics = metrics as Record<TierKey, CardMetrics>;
  return lastMetrics;
};

// ================= EMPTY CARD FALLBACK =================
const EMPTY_CARD_CACHE: Record<string, CardMetrics> = {};
const getEmptyCard = (tier: number, enchant: number): CardMetrics => {
  const key = buildTierKey(tier, enchant);
  if (!EMPTY_CARD_CACHE[key]) {
    EMPTY_CARD_CACHE[key] = {
      tier,
      enchant,
      profitPerUnit: 0,
      totalProfit: 0,
      costPerUnit: 0,
      buyPrice: 0,
      sellPrice: 0,
      intermediatePrice: 0,
      intermediateKey: null,
      isReliable: false,
      hasMarketPrices: { buy: false, sell: false },
    };
  }
  return EMPTY_CARD_CACHE[key];
};

export const selectCard =
  (tier: number, enchant: number) => (state: RefineState) => {
    const all = selectAllMetrics(state);
    return all[buildTierKey(tier, enchant)] || getEmptyCard(tier, enchant);
  };
