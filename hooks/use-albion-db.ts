"use client";

import { useState, useEffect } from "react";
import { AlbionItem } from "@/lib/types";
import { getDBItem, setDBItem } from "@/lib/db";

const ITEMS_STORE_KEY = "albion_items_data";

/**
 * HOOK: USE ALBION DB
 *
 * Synchronizes the massive static Albion database (17MB+) between
 * the server and the browser's IndexedDB.
 * This ensures search happens at local speed (0ms latency).
 */
export function useAlbionDB() {
  const [itemsList, setItemsList] = useState<AlbionItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncDatabase = async () => {
      try {
        // 1. Check local cache (IndexedDB)
        const cachedData = await getDBItem<AlbionItem[]>(ITEMS_STORE_KEY);

        if (cachedData && cachedData.length > 0) {
          setItemsList(cachedData);
          return;
        }

        // 2. Initial Download (Fallback)
        setIsLoading(true);
        const res = await fetch("/api/items");

        if (!res.ok) throw new Error("Failed to reach server database.");

        const data = await res.json();

        if (Array.isArray(data)) {
          setItemsList(data);
          // 3. Persist for future sessions
          await setDBItem(ITEMS_STORE_KEY, data);
        }
      } catch (err) {
        console.error("Critical Albion Sync Error:", err);
        setError("Failed to sync item database.");
      } finally {
        setIsLoading(false);
      }
    };

    syncDatabase();
  }, []);

  return { itemsList, isLoading, error };
}
