import { useEffect, useMemo, useState } from "react";
import {
  fetchPokemonList,
  fetchPokemonDetail,
  type PokemonDetail,
  type NamedAPIResource,
} from "@/api/pokemon";

/** Default preload size (Gen 1–2 for snappy UX) */
export const POKEMON_LIMIT = 251;

export interface UsePokemonDataOptions {
  /** How many Pokémon to preload (names then details). */
  limit?: number;
  /** Parallel fetch concurrency for details. */
  concurrency?: number;
}

/** Simple progress type used by the loading UI */
export type LoadProgress = { done: number; total: number };

/**
 * Concurrency-limited async mapper with progress callback.
 * Local to this hook to avoid an extra util dependency.
 */
async function pMap<I, O>(
  items: I[],
  mapper: (item: I, index: number) => Promise<O>,
  concurrency = 8,
  onProgress?: (done: number, total: number) => void
): Promise<O[]> {
  const total = items.length;
  const results: O[] = new Array(total);
  let i = 0;
  let done = 0;

  onProgress?.(0, total);

  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= total) break;
      try {
        results[idx] = await mapper(items[idx], idx);
      } finally {
        done++;
        onProgress?.(done, total);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, worker);
  await Promise.all(workers);
  return results;
}

/**
 * Loads a Pokémon list and prefetches details with caching + concurrency.
 * Handles API hiccups by falling back to a tiny mock trio (via detail fetch).
 */
export default function usePokemonData(
  opts: UsePokemonDataOptions = {}
) {
  const limit = opts.limit ?? POKEMON_LIMIT;
  const concurrency = opts.concurrency ?? 8;

  const [list, setList] = useState<PokemonDetail[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LoadProgress>({ done: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        let names: NamedAPIResource[] = [];
        try {
          names = await fetchPokemonList(limit);
        } catch {
          // If list fails entirely, fall back to a tiny set so UI still works.
          names = [
            { name: "bulbasaur", url: "" },
            { name: "charmander", url: "" },
            { name: "squirtle", url: "" },
          ];
          setError("Failed to load full list from PokeAPI. Showing a small mocked set.");
        }

        const details = await pMap(
          names,
          async (item) => {
            try {
              return await fetchPokemonDetail(item.name);
            } catch {
              // fetchPokemonDetail will already fall back to a mock for the trio above.
              // If another name fails unexpectedly, rethrow to surface a real error.
              throw;
            }
          },
          concurrency,
          (done, total) => !cancelled && setProgress({ done, total })
        );

        if (!cancelled) {
          details.sort((a, b) => a.id - b.id);
          setList(details);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            "Unexpected error while loading Pokémon data. Please refresh or try again later."
          );
          setList(null);
        }
      } finally {
        !cancelled && setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [limit, concurrency]);

  const allTypes = useMemo(() => {
    const set = new Set<string>();
    (list ?? []).forEach((p) => p.types.forEach((t) => set.add(t.type.name)));
    return Array.from(set).sort();
  }, [list]);

  return { list, loading, error, progress, allTypes } as const;
}
