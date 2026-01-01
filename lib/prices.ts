/**
 * PRICE API INTEGRATION
 *
 * Fetches real-time price data from the Albion Online Data Project API.
 */

import { AlbionPrice } from "./types";

/**
 * getItemPrices
 *
 * Retrieves current market prices for a specific Item ID across major cities.
 * Best Practice: We use 'revalidate: 60' to ensure prices are never older than 1 minute,
 * striking a balance between freshness and API load.
 */
export async function getItemPrices(
  itemId: string,
  locations?: string[],
  qualities?: number[]
): Promise<AlbionPrice[]> {
  // Strategy: If no locations are specified, default to fetching ALL major cities.
  // This ensures the user sees a complete market overview by default.
  const targetLocations =
    locations && locations.length > 0 ? locations : ALBION_CITIES;

  const locs = targetLocations.map((l) => encodeURIComponent(l)).join(",");
  const quals =
    qualities && qualities.length > 0 ? qualities.join(",") : "1,2,3,4,5";

  // We do NOT encodeURIComponent(itemId) here because if it's a batch request
  // (comma-separated list), encoding the commas would break the API batch parsing.
  // The caller is responsible for ensuring individual IDs are valid or encoded if needed
  // (though Albion IDs generally use chars that are safe except @, which this API handles raw).
  const res = await fetch(
    `https://www.albion-online-data.com/api/v2/stats/prices/${itemId}?locations=${locs}&qualities=${quals}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to fetch prices. Status: ${res.status} ${res.statusText}. Body: ${errorText}`
    );
  }

  const data = await res.json();
  return data as AlbionPrice[];
}

/**
 * Static metadata for Albion market qualities.
 */
export const ALBION_QUALITIES = [
  { id: 1, name: "Normal" },
  { id: 2, name: "Good" },
  { id: 3, name: "Outstanding" },
  { id: 4, name: "Excellent" },
  { id: 5, name: "Masterpiece" },
];

/**
 * Centralized City list for selection filters.
 */
export const ALBION_CITIES = [
  "Lymhurst",
  "Bridgewatch",
  "Martlock",
  "Thetford",
  "Fort Sterling",
  "Caerleon",
  "Brecilien",
];

export type { AlbionPrice } from "./types";
