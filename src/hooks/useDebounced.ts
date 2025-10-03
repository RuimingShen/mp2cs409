import { useEffect, useState } from "react";

/**
 * Returns a debounced version of `value`.
 * Updates only after `delay` ms have elapsed without further changes.
 */
export default function useDebounced<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
