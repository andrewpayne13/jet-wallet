import { CoinID } from "../types";

// CoinGecko API mapping for supported cryptocurrencies
const COINGECKO_IDS: Record<CoinID, string> = {
  [CoinID.BTC]: "bitcoin",
  [CoinID.ETH]: "ethereum",
  [CoinID.XRP]: "ripple",
  [CoinID.USDT]: "tether",
  [CoinID.SOL]: "solana",
  [CoinID.DOGE]: "dogecoin",
};

// CoinCap API mapping (fallback)
const COINCAP_IDS: Record<CoinID, string> = {
  [CoinID.BTC]: "bitcoin",
  [CoinID.ETH]: "ethereum",
  [CoinID.XRP]: "xrp",
  [CoinID.USDT]: "tether",
  [CoinID.SOL]: "solana",
  [CoinID.DOGE]: "dogecoin",
};

// Fetch prices from CoinGecko API (primary source)
async function fetchFromCoinGecko(): Promise<Partial<Record<CoinID, number>>> {
  const idsParam = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

  try {
    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as Record<string, { usd: number }>;
    
    const prices: Partial<Record<CoinID, number>> = {};
    
    // Map the response back to our CoinID enum
    Object.entries(COINGECKO_IDS).forEach(([coinId, geckoId]) => {
      const price = json[geckoId]?.usd;
      if (typeof price === 'number' && price > 0) {
        prices[coinId as CoinID] = price;
      }
    });

    console.log('CoinGecko prices fetched:', prices);
    return prices;
  } catch (error) {
    console.error('CoinGecko fetch failed:', error);
    throw error;
  }
}

// Fetch prices from CoinCap API (fallback)
async function fetchFromCoinCap(): Promise<Partial<Record<CoinID, number>>> {
  const idsParam = Object.values(COINCAP_IDS).join(",");
  const url = `https://api.coincap.io/v2/assets?ids=${idsParam}`;

  try {
    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`CoinCap API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as { data: { id: string; priceUsd: string }[] };
    
    if (!json.data || !Array.isArray(json.data)) {
      throw new Error('Invalid CoinCap API response format');
    }

    const prices: Partial<Record<CoinID, number>> = {};
    
    // Map the response back to our CoinID enum
    json.data.forEach((asset) => {
      const coinId = Object.entries(COINCAP_IDS).find(([_, capId]) => capId === asset.id)?.[0] as CoinID;
      if (coinId && asset.priceUsd) {
        const price = parseFloat(asset.priceUsd);
        if (!isNaN(price) && price > 0) {
          prices[coinId] = price;
        }
      }
    });

    console.log('CoinCap prices fetched:', prices);
    return prices;
  } catch (error) {
    console.error('CoinCap fetch failed:', error);
    throw error;
  }
}

// Fallback static prices (last resort)
function getFallbackPrices(): Partial<Record<CoinID, number>> {
  console.warn('Using fallback static prices - API calls failed');
  return {
    [CoinID.BTC]: 43250.00,
    [CoinID.ETH]: 2580.00,
    [CoinID.XRP]: 0.52,
    [CoinID.USDT]: 1.00,
    [CoinID.SOL]: 98.50,
    [CoinID.DOGE]: 0.078,
  };
}

// Main function to fetch live cryptocurrency prices
export async function fetchLivePrices(): Promise<Partial<Record<CoinID, number>>> {
  console.log('Fetching live cryptocurrency prices...');
  
  // Try CoinGecko first (most reliable)
  try {
    const prices = await fetchFromCoinGecko();
    if (Object.keys(prices).length > 0) {
      return prices;
    }
  } catch (error) {
    console.warn('CoinGecko failed, trying CoinCap...', error);
  }

  // Try CoinCap as fallback
  try {
    const prices = await fetchFromCoinCap();
    if (Object.keys(prices).length > 0) {
      return prices;
    }
  } catch (error) {
    console.warn('CoinCap failed, using fallback prices...', error);
  }

  // Use static fallback prices as last resort
  return getFallbackPrices();
}
