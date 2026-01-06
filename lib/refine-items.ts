import {
  ResourceType,
  TierKey,
  buildTierKey,
  ENCHANT_LEVELS,
  TIER_LEVELS,
} from "@/hooks/use-refine-store";
import { withEnchant } from "@/lib/search";

const BASE_REFINED_IDS: Record<ResourceType, string> = {
  WOOD: "PLANKS",
  ORE: "METALBAR",
  FIBER: "CLOTH",
  HIDE: "LEATHER",
  STONE: "STONEBLOCK",
};

const BASE_RAW_IDS: Record<ResourceType, string> = {
  WOOD: "WOOD",
  ORE: "ORE",
  FIBER: "FIBER",
  HIDE: "HIDE",
  STONE: "ROCK",
};

const DISPLAY_NAMES: Record<ResourceType, { raw: string; refined: string }> = {
  WOOD: { raw: "Logs", refined: "Planks" },
  ORE: { raw: "Ore", refined: "Bars" },
  FIBER: { raw: "Fiber", refined: "Cloth" },
  HIDE: { raw: "Hide", refined: "Leather" },
  STONE: { raw: "Rocks", refined: "Blocks" },
};

export function getRefineDisplayName(
  resourceType: ResourceType,
  mode: "raw" | "refined"
): string {
  return DISPLAY_NAMES[resourceType][mode];
}

export function getRefinedItemId(
  resourceType: ResourceType,
  tier: number,
  enchant: number
): string {
  const base = BASE_REFINED_IDS[resourceType];
  const coreId = `T${tier}_${base}`;
  return withEnchant(coreId, enchant);
}

export function getRawItemId(
  resourceType: ResourceType,
  tier: number,
  enchant: number
): string {
  const base = BASE_RAW_IDS[resourceType];
  const coreId = `T${tier}_${base}`;
  return withEnchant(coreId, enchant);
}

export interface RefineItemIdSet {
  raw: string;
  refined: string;
}

export function buildFullRefineIdMap(
  resourceType: ResourceType
): Record<TierKey, RefineItemIdSet> {
  const result: Record<TierKey, RefineItemIdSet> = {} as Record<
    TierKey,
    RefineItemIdSet
  >;
  TIER_LEVELS.forEach((tier) => {
    const enchants = tier < 4 ? [0] : ENCHANT_LEVELS;
    enchants.forEach((enchant) => {
      const key = buildTierKey(tier, enchant);
      result[key] = {
        raw: getRawItemId(resourceType, tier, enchant),
        refined: getRefinedItemId(resourceType, tier, enchant),
      };
    });
  });
  return result;
}

export function buildRefineItemIdMap(
  resourceType: ResourceType
): Record<TierKey, string> {
  const result: Record<TierKey, string> = {} as Record<TierKey, string>;
  TIER_LEVELS.forEach((tier) => {
    const enchants = tier < 4 ? [0] : ENCHANT_LEVELS;
    enchants.forEach((enchant) => {
      const key = buildTierKey(tier, enchant);
      result[key] = getRefinedItemId(resourceType, tier, enchant);
    });
  });
  return result;
}
