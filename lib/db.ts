/**
 * CLIENT-SIDE DATABASE (IndexedDB)
 *
 * WHY INDEXEDDB?
 * 1. LocalStorage is limited to ~5MB. The Albion item database is ~17MB.
 * 2. IndexedDB can store hundreds of megabytes without slowing down the browser.
 * 3. This allows us to cache the entire Albion item list PERMANENTLY on the user's
 *    device, resulting in 0ms network latency for all future searches.
 */

const DB_NAME = "albion_market_db";
const STORE_NAME = "static_data";
const DB_VERSION = 5;

/**
 * Opens the IndexedDB connection and ensures the 'static_data' store exists.
 */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // If store exists, we clear it to ensure new data structure is applied
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }

      db.createObjectStore(STORE_NAME);
    };
  });
}

/**
 * Saves an item (key-value) to the IndexedDB store.
 * Best Practice: Use this for large objects data that doesn't change frequently.
 */
export async function setDBItem(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Retrieves an item from the IndexedDB store.
 * Returns null if not found.
 */
export async function getDBItem<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}
