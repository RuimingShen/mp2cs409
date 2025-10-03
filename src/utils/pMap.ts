/**
 * Concurrency-limited async map with optional progress + abort.
 *
 * Usage:
 *   const outputs = await pMap(items, async (item, i, signal) => {
 *     if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
 *     return await doWork(item);
 *   }, { concurrency: 8, onProgress: (done, total) => {...}, signal });
 */

export interface PMapOptions {
  /** Max concurrent tasks (default 8). */
  concurrency?: number;
  /** Called when an item settles (success or error). */
  onProgress?: (done: number, total: number) => void;
  /** Abort the whole mapping early. */
  signal?: AbortSignal | null;
  /**
   * If true, collect errors and continue, returning results where possible.
   * Rejections become `undefined` in the output to preserve order.
   * Default false (first rejection rejects the whole promise).
   */
  continueOnError?: boolean;
}

export default async function pMap<I, O>(
  items: I[],
  mapper: (item: I, index: number, signal?: AbortSignal | null) => Promise<O>,
  opts: PMapOptions = {}
): Promise<O[]> {
  const total = items.length;
  const results = new Array<O>(total);
  const errors = new Array<any>(total).fill(undefined);
  const concurrency = Math.max(1, Math.min(opts.concurrency ?? 8, total));

  let i = 0;
  let done = 0;
  const { onProgress, signal, continueOnError = false } = opts;

  const checkAbort = () => {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
  };

  onProgress?.(0, total);

  async function worker() {
    while (true) {
      checkAbort();
      const idx = i++;
      if (idx >= total) break;

      try {
        const out = await mapper(items[idx], idx, signal);
        results[idx] = out;
      } catch (e) {
        if (!continueOnError) {
          throw e;
        }
        // Keep place to preserve order; caller can post-filter undefineds if desired
        errors[idx] = e;
        // @ts-expect-error intentional: leave undefined for failed slot
        results[idx] = undefined;
      } finally {
        done++;
        onProgress?.(done, total);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  if (continueOnError) {
    // Run workers but never reject; we already stored undefined for failures.
    await Promise.allSettled(workers);
    return results;
  } else {
    // Reject on first error
    await Promise.all(workers);
    return results;
  }
}

/** Helper to run pMap and also return per-item errors when continueOnError = true. */
export async function pMapSettled<I, O>(
  items: I[],
  mapper: (item: I, index: number, signal?: AbortSignal | null) => Promise<O>,
  opts: Omit<PMapOptions, "continueOnError"> = {}
): Promise<{ results: (O | undefined)[]; errors: (any | undefined)[] }> {
  const errors: (any | undefined)[] = new Array(items.length).fill(undefined);
  const res = await pMap<I, O>(items, async (item, idx, signal) => {
    try {
      return await mapper(item, idx, signal);
    } catch (e) {
      errors[idx] = e;
      // @ts-expect-error allow undefined on failure
      return undefined;
    }
  }, { ...opts, continueOnError: true });

  return { results: res, errors };
}
