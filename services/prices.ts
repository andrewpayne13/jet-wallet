import { CoinID } from "../types";

// Live price providers (proxied via Vite dev server to avoid CORS):
// - CoinGecko (/api/coingecko/...)
// - CoinCap   (/api/coincap/...)   [fallback]
// - Coinbase  (/api/coinbase/...)  [fallback]

const COINGECKO_IDS: Record<CoinID, string> = {
  [CoinID.BTC]: "bitcoin",
  [CoinID.ETH]: "ethereum",
  [CoinID.XRP]: "ripple",
  [CoinID.USDT]: "tether",
  [CoinID.SOL]: "solana",
  [CoinID.DOGE]: "dogecoin",
};

const COINCAP_IDS: Record<CoinID, string> = {
  [CoinID.BTC]: "bitcoin",
  [CoinID.ETH]: "ethereum",
  [CoinID.XRP]: "xrp",
  [CoinID.USDT]: "tether",
  [CoinID.SOL]: "solana",
  [CoinID.DOGE]: "dogecoin",
};

const COINBASE_SYMBOLS: Record<CoinID, string> = {
  [CoinID.BTC]: "BTC",
  [CoinID.ETH]: "ETH",
  [CoinID.XRP]: "XRP",
  [CoinID.USDT]: "USDT",
  [CoinID.SOL]: "SOL",
  [CoinID.DOGE]: "DOGE",
};

async function fetchFromCoinGecko(): Promise<Partial<Record<CoinID, number>>> {
  const idsParam = Object.values(COINGECKO_IDS).join(",");
  const url = `/api/coingecko/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CoinGecko fetch failed: ${res.status}`);

  const json = (await res.json()) as Record<string, { usd: number }>;

  return {
    [CoinID.BTC]: json[COINGECKO_IDS[CoinID.BTC]]?.usd,
    [CoinID.ETH]: json[COINGECKO_IDS[CoinID.ETH]]?.usd,
    [CoinID.XRP]: json[COINGECKO_IDS[CoinID.XRP]]?.usd,
    [CoinID.USDT]: json[COINGECKO_IDS[CoinID.USDT]]?.usd,
    [CoinID.SOL]: json[COINGECKO_IDS[CoinID.SOL]]?.usd,
    [CoinID.DOGE]: json[COINGECKO_IDS[CoinID.DOGE]]?.usd,
  };
}

async function fetchFromCoinCap(): Promise<Partial<Record<CoinID, number>>> {
  const idsParam = Object.values(COINCAP_IDS).join(",");
  const url = `/api/coincap/v2/assets?ids=${idsParam}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CoinCap fetch failed: ${res.status}`);

  const json = (await res.json()) as { data: { id: string; priceUsd: string }[] };
  const byId = new Map(json.data.map((d) => [d.id, parseFloat(d.priceUsd)]));

  return {
    [CoinID.BTC]: byId.get(COINCAP_IDS[CoinID.BTC]),
    [CoinID.ETH]: byId.get(COINCAP_IDS[CoinID.ETH]),
    [CoinID.XRP]: byId.get(COINCAP_IDS[CoinID.XRP]),
    [CoinID.USDT]: byId.get(COINCAP_IDS[CoinID.USDT]),
    [CoinID.SOL]: byId.get(COINCAP_IDS[CoinID.SOL]),
    [CoinID.DOGE]: byId.get(COINCAP_IDS[CoinID.DOGE]),
  };
}

// Coinbase: single call for USD base, invert USD->COIN rate to get COIN price in USD.
// Endpoint: /api/coinbase/v2/exchange-rates?currency=USD
async function fetchFromCoinbase(): Promise<Partial<Record<CoinID, number>>> {
  const url = `/api/coinbase/v2/exchange-rates?currency=USD`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Coinbase fetch failed: ${res.status}`);
  const json = (await res.json()) as { data: { currency: string; rates: Record<string, string> } };
  const rates = json?.data?.rates || {};
  const inv = (symbol: string): number | undefined => {
    const v = parseFloat(rates[symbol]);
    return v ? 1 / v : undefined;
    // v is USD->COIN rate, invert to get COIN->USD price.
  };

  return {
    [CoinID.BTC]: inv(COINBASE_SYMBOLS[CoinID.BTC]),
    [CoinID.ETH]: inv(COINBASE_SYMBOLS[CoinID.ETH]),
    [CoinID.XRP]: inv(COINBASE_SYMBOLS[CoinID.XRP]),
    [CoinID.USDT]: inv(COINBASE_SYMBOLS[CoinID.USDT]),
    [CoinID.SOL]: inv(COINBASE_SYMBOLS[CoinID.SOL]),
    [CoinID.DOGE]: inv(COINBASE_SYMBOLS[CoinID.DOGE]),
  };
}

export async function fetchLivePrices(): Promise<Partial<Record<CoinID, number>>> {
  // Prefer Coinbase first to avoid frequent 429s on CoinGecko.
  try {
    return await fetchFromCoinbase();
  } catch (_e1) {
    try {
      return await fetchFromCoinGecko();
    } catch (_e2) {
      try {
        return await fetchFromCoinCap();
      } catch (_e3) {
        // Final fallback: return empty so UI keeps last known values (no static seed flash)
        return {};
      }
    }
  }
}
