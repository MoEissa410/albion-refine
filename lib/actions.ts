/**
 * SERVER ACTIONS
 *
 * Used for secure, server-side data operations in Next.js.
 */
"use server";

import { getAllItems } from "./items";
import { searchItems } from "./search";
import { AlbionItem } from "./types";

/**
 * searchAlbionItems
 *
 * A server-side fallback for searching items.
 *
 * PRO-TIP: While we prefer IndexedDB search on the client for 0ms latency,
 * this server action ensures search functionality works even if the local
 * database is still downloading, clearing, or unsupported by the browser.
 *
 * @param query - The item name or ID to search for.
 */
export async function searchAlbionItems(query: string): Promise<AlbionItem[]> {
  const allItems = await getAllItems();
  return searchItems(allItems, query);
}
