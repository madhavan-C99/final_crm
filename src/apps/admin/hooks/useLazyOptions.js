import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook to lazily fetch dropdown options on-demand when a container (modal, popover, select) opens.
 *
 * @param {Function} fetchFn - Async function returning data
 * @param {boolean} isOpen - Trigger condition (e.g. modal open, menu anchor truthy)
 * @param {Object} options - Configuration options ({ initialData, resetOnClose })
 * @returns {{ data: any, setData: Function, loading: boolean, error: any, refetch: Function, hasFetched: boolean }}
 */
export function useLazyOptions(fetchFn, isOpen, options = {}) {
  const { initialData = null, resetOnClose = false } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchOptions = useCallback(async () => {
    if (!fetchFn || isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const res = await fetchFn();
      setData(res);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error("[useLazyOptions] Error fetching dropdown options:", err);
      setError(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchFn]);

  useEffect(() => {
    if (isOpen) {
      if (!hasFetchedRef.current) {
        fetchOptions();
      }
    } else if (resetOnClose) {
      hasFetchedRef.current = false;
    }
  }, [isOpen, fetchOptions, resetOnClose]);

  const refetch = useCallback(() => {
    hasFetchedRef.current = false;
    return fetchOptions();
  }, [fetchOptions]);

  return { data, setData, loading, error, refetch, hasFetched: hasFetchedRef.current };
}

export default useLazyOptions;
