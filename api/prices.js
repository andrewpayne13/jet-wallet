// Vercel serverless function to fetch cryptocurrency prices
// This bypasses CORS issues by making the API calls server-side

const COINGECKO_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum", 
  XRP: "ripple",
  USDT: "tether",
  SOL: "solana",
  DOGE: "dogecoin",
};

const COINCAP_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  XRP: "xrp", 
  USDT: "tether",
  SOL: "solana",
  DOGE: "dogecoin",
};

async function fetchFromCoinGecko() {
  const idsParam = Object.values(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; JetWallet/1.0)',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    const prices = {};
    Object.entries(COINGECKO_IDS).forEach(([coinId, geckoId]) => {
      const price = data[geckoId]?.usd;
      if (typeof price === 'number' && price > 0) {
        prices[coinId] = price;
      }
    });

    return prices;
  } catch (error) {
    throw error;
  }
}

async function fetchFromCoinCap() {
  const idsParam = Object.values(COINCAP_IDS).join(",");
  const url = `https://api.coincap.io/v2/assets?ids=${idsParam}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; JetWallet/1.0)',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CoinCap API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid CoinCap API response format');
    }

    const prices = {};
    data.data.forEach((asset) => {
      const coinId = Object.entries(COINCAP_IDS).find(([_, capId]) => capId === asset.id)?.[0];
      if (coinId && asset.priceUsd) {
        const price = parseFloat(asset.priceUsd);
        if (!isNaN(price) && price > 0) {
          prices[coinId] = price;
        }
      }
    });

    return prices;
  } catch (error) {
    throw error;
  }
}

// Alternative API source using CryptoCompare
async function fetchFromCryptoCompare() {
  const symbols = Object.keys(COINGECKO_IDS).join(',');
  const url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols}&tsyms=USD`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; JetWallet/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CryptoCompare API error: ${response.status}`);
    }

    const data = await response.json();
    
    const prices = {};
    Object.keys(COINGECKO_IDS).forEach((coinId) => {
      const price = data[coinId]?.USD;
      if (typeof price === 'number' && price > 0) {
        prices[coinId] = price;
      }
    });

    return prices;
  } catch (error) {
    throw error;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Try CoinGecko first
    try {
      const prices = await fetchFromCoinGecko();
      if (Object.keys(prices).length > 0) {
        res.status(200).json({ 
          success: true, 
          data: prices, 
          source: 'coingecko',
          timestamp: Date.now()
        });
        return;
      }
    } catch (error) {
      // Silent fallback to CoinCap
    }

    // Try CoinCap as fallback
    try {
      const prices = await fetchFromCoinCap();
      if (Object.keys(prices).length > 0) {
        res.status(200).json({ 
          success: true, 
          data: prices, 
          source: 'coincap',
          timestamp: Date.now()
        });
        return;
      }
    } catch (error) {
      // Silent fallback to CryptoCompare
    }

    // Try CryptoCompare as third fallback
    try {
      const prices = await fetchFromCryptoCompare();
      if (Object.keys(prices).length > 0) {
        res.status(200).json({ 
          success: true, 
          data: prices, 
          source: 'cryptocompare',
          timestamp: Date.now()
        });
        return;
      }
    } catch (error) {
      // Silent failure
    }

    // If all APIs fail, return error (no fallback static prices)
    res.status(503).json({ 
      success: false, 
      error: 'Service temporarily unavailable',
      timestamp: Date.now()
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      timestamp: Date.now()
    });
  }
}
