import { useCallback, useEffect, useState } from 'react';
import { api, PlaidItemSummary } from '../lib/api';

interface UsePlaidItemsOptions {
  enabled?: boolean;
}

export function usePlaidItems(options: UsePlaidItemsOptions = {}) {
  const { enabled = true } = options;
  const [items, setItems] = useState<PlaidItemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await api.plaid.getItems();
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load connected bank accounts'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      void refresh();
    }
  }, [enabled, refresh]);

  return { items, loading, error, refresh, setItems };
}
