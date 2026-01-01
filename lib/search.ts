import { AlbionItem } from "./types";

/**
 * searchItems
 *
 * Performs a broad search in a list of Albion items.
 * Optimized for local IndexedDB search.
 */
export function searchItems(items: AlbionItem[], query: string): AlbionItem[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();

  return items
    .filter((item) => {
      const name = item.LocalizedNames?.["EN-US"]?.toLowerCase() || "";
      const id = item.UniqueName.toLowerCase();
      return name.includes(q) || id.includes(q);
    })
    .slice(0, 50);
}

/**
 * parseAlbionId
 *
 * Deconstructs an Albion UniqueName into its core components.
 * Example: T4_HIDE_LEVEL1@1 -> { base: "HIDE", tier: "4", enchant: "1" }
 */
export function parseAlbionId(itemId: string) {
  const parts = itemId.split("@");
  let base = parts[0];
  const enchant = parts[1] || "0";

  // Strip resource level suffix (e.g., _LEVEL1)
  base = base.replace(/_LEVEL[1-4]$/, "");

  let tier = "0";
  // Detect and extract Tier (e.g., T4_)
  if (base.match(/^T[1-8]_/)) {
    tier = base.charAt(1);
    base = base.substring(3);
  }

  return { base, tier, enchant };
}

/**
 * formatRelativeTime
 *
 * Converts an Albion API timestamp (UTC) into a relative string.
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString || dateString.startsWith("0001")) return "N/A";

  const date = new Date(dateString + "Z");
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * withEnchant
 *
 * CONSTRUCTS ALBION ITEM IDs WITH ENCHANTMENTS
 */
export function withEnchant(itemId: string, enchant?: number | string) {
  const e = String(enchant);
  let base = itemId.split("@")[0].replace(/_LEVEL[1-4]$/, "");

  if (!e || e === "0") return base;

  // Resources use _LEVEL format, others use @ format
  const isResource =
    /(^|_)(ORE|WOOD|ROCK|FIBER|HIDE|PLANKS|METALBAR|STONEBLOCK|CLOTH|LEATHER|RESOURCES_)/.test(
      base
    );

  if (isResource) {
    return `${base}_LEVEL${e}@${e}`;
  }

  return `${base}@${e}`;
}

/**
 * getBaseId
 *
 * Extracts the name without Tier and Enchantment.
 */
export function getBaseId(itemId: string): string {
  const { base } = parseAlbionId(itemId);
  return base;
}

/**
 * getItemIcon
 */
export function getItemIcon(itemId: string, quality: number = 1): string {
  return `https://render.albiononline.com/v1/item/${itemId}.png?size=100&quality=${quality}`;
}
