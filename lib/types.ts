/**
 * ALBION TYPE DEFINITIONS
 *
 * Centralized interfaces for Albion Online data structures.
 */

export interface AlbionItem {
  UniqueName: string; // The internal game ID (e.g. T4_BAG@1)
  LocalizedNames?: {
    "EN-US"?: string; // The human-readable name
    [key: string]: string | undefined;
  };
  Tier: number;
}

/**
 * AlbionPrice
 *
 * Represents market data returned by the Albion Online Data Project API.
 */
export interface AlbionPrice {
  item_id: string;
  city: string;
  quality: number; // 1-5 (Normal to Masterpiece)
  sell_price_min: number; // The cheapest listing on the market
  sell_price_min_date: string; // Update timestamp (UTC)
  sell_price_max: number;
  sell_price_max_date: string;
  buy_price_min: number;
  buy_price_min_date: string;
  buy_price_max: number; // The highest buy-order currently active
  buy_price_max_date: string;
}
