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
  isReliable: boolean; // True if we have all necessary price inputs
  hasMarketPrices: {
    buy: boolean;
    sell: boolean;
  };
}

export const TIER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const ENCHANT_LEVELS = [0, 1, 2, 3, 4] as const;

export const buildTierKey = (tier: number, enchant: number): TierKey =>
  `${tier}.${enchant}`;

const createEmptyPrices = (): Record<TierKey, TierPrice> => {
  const next: Record<TierKey, TierPrice> = {} as Record<TierKey, TierPrice>;
  TIER_LEVELS.forEach((tier) => {
    ENCHANT_LEVELS.forEach((enchant) => {
      next[buildTierKey(tier, enchant)] = { buy: 0, sell: 0 };
    });
  });
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
  marketPrices: Record<TierKey, TierPrice>; // Original prices for reference
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

export const useRefineStore = create<RefineState>((set) => ({
  resourceType: "WOOD",
  returnRate: 36.7,
  taxRate: 13,
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
        const castKey = key as TierKey;

        // Update editable prices
        nextPrices[castKey] = {
          buy: value.buy ?? nextPrices[castKey].buy,
          sell: value.sell ?? nextPrices[castKey].sell,
        };

        // Also update market prices for reference (don't change after first load unless we fetch again)
        nextMarketPrices[castKey] = {
          buy: value.buy ?? nextMarketPrices[castKey].buy,
          sell: value.sell ?? nextMarketPrices[castKey].sell,
        };

        // Store timestamps
        const v = value as Partial<TierPrice> & {
          buyTimestamp?: string;
          sellTimestamp?: string;
        };
        if (v.buyTimestamp || v.sellTimestamp) {
          nextTimestamps[castKey] = {
            buy: v.buyTimestamp,
            sell: v.sellTimestamp,
          };
        }
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

const clampRate = (rate: number) => Math.min(Math.max(rate, 0), 100);

const getRecipe = (tier: number) =>
  REFINING_RECIPES[tier] ?? { tier, rawAmount: 1, refinedPrevAmount: 0 };

// Nutrition values per tier in Albion Online
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

// Internal cache for memoizing metrics calculation
let lastState: any = null;
let lastMetrics: Record<TierKey, CardMetrics> | null = null;

/**
 * CHAINED CALCULATION ENGINE
 * Computes metrics with tier-to-tier dependencies.
 * Memoized to ensure referential stability and performance.
 */
export const selectAllMetrics = (
  state: RefineState
): Record<TierKey, CardMetrics> => {
  // Return cached result if state hasn't changed
  if (state === lastState && lastMetrics) {
    return lastMetrics;
  }

  const metrics: Record<string, CardMetrics> = {};

  const tiers = [2, 3, 4, 5, 6, 7, 8];
  const enchantments = [0, 1, 2, 3, 4];

  const rr = clampRate(state.returnRate) / 100;
  const tax = clampRate(state.taxRate) / 100;

  // Real yield per craft attempt
  const unitsProducedPerCraft = 1 / Math.max(0.0001, 1 - rr);

  tiers.forEach((tier) => {
    enchantments.forEach((enchant) => {
      // T2 and T3 only have flat (.0) versions
      if (tier < 4 && enchant > 0) return;

      const key = buildTierKey(tier, enchant);
      const recipe = getRecipe(tier);

      const rawPriceInput = state.prices[key]?.buy || 0;
      const sellPriceInput = state.prices[key]?.sell || 0;

      // DEPENDENCY LOGIC:
      // If we need previous tier refined (refinedPrevAmount > 0),
      // we prefer the market price of the previous tier's FLAT version if available.
      // Fallback: use the production cost of the previous tier.
      let prevRefinedInput = 0;
      let isIngredientReliable = true;

      if (recipe.refinedPrevAmount > 0) {
        // Enchantment carries over for previous tier ingredient (T4+),
        // except for T2/T3 which only have flat versions.
        const prevEnchant = tier - 1 < 4 ? 0 : enchant;
        const prevKey = buildTierKey(tier - 1, prevEnchant);

        const prevMarketPrice = state.prices[prevKey]?.sell || 0;
        const prevProdCost = metrics[prevKey]?.costPerUnit || 0;

        // Best Strategy: Use market price if it exists, otherwise use production cost
        if (prevMarketPrice > 0) {
          prevRefinedInput = prevMarketPrice;
          // isIngredientReliable remains true if market price is available
        } else if (prevProdCost > 0) {
          prevRefinedInput = prevProdCost;
          // If we have to estimate the cost, it's no longer 'reliable' in terms of market data
          isIngredientReliable = false;
        } else {
          // The chain is broken
          isIngredientReliable = false;
        }
      }

      // 1. Calculate ingredient costs
      const materialCost =
        recipe.rawAmount * rawPriceInput +
        recipe.refinedPrevAmount * prevRefinedInput;

      // 2. Add Shop Fee (Usage Fee)
      const nutrition = TIER_NUTRITION[tier] || 0;
      const shopFeePerCraft = (state.shopFee / 100) * nutrition;

      // 3. Resulting cost per single refined unit
      const costPerUnit = materialCost * (1 - rr) + shopFeePerCraft;

      // 4. Reliability Tracking
      // Profit is reliable only if:
      // - We have the CURRENT tier's raw material price
      // - We have the CURRENT tier's output sell price
      // - The previous tier's refined component is reliable
      const isReliable =
        rawPriceInput > 0 && sellPriceInput > 0 && isIngredientReliable;

      // 5. Profit calculation
      const netSellPrice = sellPriceInput * (1 - tax);
      const profitPerUnit = netSellPrice - costPerUnit;
      const totalProfit = profitPerUnit * state.quantity;

      metrics[key] = {
        tier,
        enchant,
        profitPerUnit,
        totalProfit,
        costPerUnit: Math.max(0, costPerUnit),
        buyPrice: rawPriceInput,
        sellPrice: sellPriceInput,
        isReliable,
        hasMarketPrices: {
          buy: rawPriceInput > 0,
          sell: sellPriceInput > 0,
        },
      };
    });
  });

  // Update cache
  lastState = state;
  lastMetrics = metrics as Record<TierKey, CardMetrics>;

  return lastMetrics;
};

// Stable empty card for fallbacks
const EMPTY_CARD_CACHE: Record<string, CardMetrics> = {};

const getEmptyCard = (tier: number, enchant: number): CardMetrics => {
  const key = `${tier}.${enchant}`;
  if (!EMPTY_CARD_CACHE[key]) {
    EMPTY_CARD_CACHE[key] = {
      tier,
      enchant,
      profitPerUnit: 0,
      totalProfit: 0,
      costPerUnit: 0,
      buyPrice: 0,
      sellPrice: 0,
      isReliable: false,
      hasMarketPrices: {
        buy: false,
        sell: false,
      },
    };
  }
  return EMPTY_CARD_CACHE[key];
};

export const selectCard =
  (tier: number, enchant: number) => (state: RefineState) => {
    const all = selectAllMetrics(state);
    return all[buildTierKey(tier, enchant)] || getEmptyCard(tier, enchant);
  };
