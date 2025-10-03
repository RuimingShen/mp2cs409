/**
 * Tiny localStorage cache with TTL + namespace support.
 * Falls back to in-memory cache if localStorage is unavailable (SSR/tests).
 *
 * Usage:
 *   cacheSet("detail_25", data)                       // default ns "app" + 7d TTL
 *   const d = cacheGet<PokemonDetail>("detail_25")
 *   cacheSet("list_251", results, { namespace: "poke" })
 *   cacheRemove("detail_25", { namespace: "poke" })
 *   cacheClearNamespace("poke")
 */

export interface CacheOptions {
  /** Namespace to avoid key collisions (default "app"). */
  namespace?: string;
  /** Time-to-live in ms (default 7 days). */
  ttl?: number;
}

const DEFAULT_NAMESPACE = "app";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SEP = "::";

type CacheEnvelope<T> = {
  data: T;
  fetchedAt: number;
  ttl: number;
};

function k(key: string, ns?: string) {
  return `${ns ?? DEFAULT_NAMESPACE}${SEP}${key}`;
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    // Access may throw in some sandboxed environments
    const s = window.localStorage;
    const testKey = "__cache_test__";
    s.setItem(testKey, "1");
    s.removeItem(testKey);
    return s;
  } catch {
    return null;
  }
}

// In-memory fallback store
const memStore = new Map<string, string>();
const storage = getStorage();

function readItem(key: string): string | null {
  try {
    return storage ? storage.getItem(key) : memStore.get(key) ?? null;
  } catch {
    return null;
  }
}

function writeItem(key: string, value: string) {
  try {
    if (storage) storage.setIte
