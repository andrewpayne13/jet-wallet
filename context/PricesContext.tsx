import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { CoinID } from "../types";
import { fetchLivePrices } from "../services/prices";

type Prices = Record<CoinID, number>;

interface PricesContextType {
  prices: Prices;
  getPrice: (id: CoinID) => number;
  lastUpdated?: number;
  refresh: () => Promise<void>;
}

export const PricesContext = createContext<PricesContextType>({
  prices: {
    [CoinID.BTC]: 0,
    [CoinID.ETH]: 0,
    [CoinID.XRP]: 0,
    [CoinID.USDT]: 0,
    [CoinID.SOL]: 0,
    [CoinID.DOGE]: 0,
  },
  getPrice: () => 0,
  lastUpdated: undefined,
  refresh: async () => {},
});

export const PricesProvider: React.FC<{ children: React.ReactNode; intervalMs?: number }> = ({
  children,
  intervalMs = 60000,
}) => {
  const empty: Prices = {
    [CoinID.BTC]: 0,
    [CoinID.ETH]: 0,
    [CoinID.XRP]: 0,
    [CoinID.USDT]: 0,
    [CoinID.SOL]: 0,
    [CoinID.DOGE]: 0,
  };

  const [prices, setPrices] = useState<Prices>(() => {
    try {
      const raw = localStorage.getItem("jet_wallet_prices");
      if (raw) {
        const saved = JSON.parse(raw) as { prices?: Partial<Prices> };
        return { ...empty, ...(saved.prices || {}) };
      }
    } catch {}
    return empty;
  });

  const [lastUpdated, setLastUpdated] = useState<number | undefined>(() => {
    try {
      const raw = localStorage.getItem("jet_wallet_prices");
      if (raw) {
        const saved = JSON.parse(raw) as { lastUpdated?: number };
        return saved.lastUpdated;
      }
    } catch {}
    return undefined;
  });

  const refresh = useCallback(async () => {
    try {
      const latest = await fetchLivePrices();
      
      // Only update if we got valid data
      if (latest && Object.keys(latest).length > 0) {
        // Merge new values into current, keeping last known if a symbol is missing.
        setPrices(prev => {
          const merged = { ...prev, ...(latest as Partial<Prices>) };
          try {
            localStorage.setItem(
              "jet_wallet_prices",
              JSON.stringify({ prices: merged, lastUpdated: Date.now() })
            );
          } catch (error) {
            // Silent localStorage error handling
          }
          return merged;
        });
        setLastUpdated(Date.now());
      }
    } catch (error) {
      // Don't update lastUpdated on error to indicate stale data
      // Keep existing prices if any, don't reset to zero
    }
  }, []);

  useEffect(() => {
    // initial fetch
    refresh();
    // polling
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);

  const getPrice = useCallback((id: CoinID) => prices[id] ?? 0, [prices]);

  const value = useMemo(
    () => ({ prices, getPrice, lastUpdated, refresh }),
    [prices, getPrice, lastUpdated, refresh]
  );

  return <PricesContext.Provider value={value}>{children}</PricesContext.Provider>;
};
