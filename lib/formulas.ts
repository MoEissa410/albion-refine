export interface RefiningRecipe {
  tier: number;
  rawAmount: number;
  refinedPrevAmount: number;
}

export const REFINING_RECIPES: Record<number, RefiningRecipe> = {
  1: { tier: 1, rawAmount: 1, refinedPrevAmount: 0 },
  2: { tier: 2, rawAmount: 1, refinedPrevAmount: 0 },
  3: { tier: 3, rawAmount: 2, refinedPrevAmount: 1 },
  4: { tier: 4, rawAmount: 2, refinedPrevAmount: 1 },
  5: { tier: 5, rawAmount: 3, refinedPrevAmount: 1 },
  6: { tier: 6, rawAmount: 4, refinedPrevAmount: 1 },
  7: { tier: 7, rawAmount: 5, refinedPrevAmount: 1 },
  8: { tier: 8, rawAmount: 5, refinedPrevAmount: 1 },
};

export const calculateRefineProfit = (
  rawPrice: number,
  prevTierPrice: number,
  resultPrice: number,
  returnRate: number,
  fee: number,
  amount: number
) => {
  // Amount to produce
  const rr = returnRate / 100;

  // Cost = (Raw * RawPrice + Prev * PrevPrice) / (1 - rr) ? No, simpler:
  // Each craft consumes materials but returns some.
  const effectiveCost = (rawPrice * 2 + prevTierPrice * 1) * (1 - rr); // Simplified for T4
  // Actually, more accurate:
  // Total Materials = rawAmount + refinedPrevAmount
  // Cost per craft = rawAmount * rawPrice + refinedPrevAmount * prevTierPrice
  // Result per craft = 1 + rr + rr^2 ... = 1 / (1 - rr)

  const recipe = REFINING_RECIPES[4]; // Default to T4 for example

  const costPerUnit = (rawPrice * 2 + prevTierPrice * 1) * (1 - rr);
  const profitPerUnit = resultPrice - costPerUnit - fee;

  return {
    costPerUnit,
    profitPerUnit,
    totalProfit: profitPerUnit * amount,
  };
};
