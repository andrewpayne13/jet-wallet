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
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JetWallet/1.0'
      }
    });
    
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
    console.error('CoinGecko fetch failed:', error);
    throw error;
  }
}

async function fetchFromCoinCap() {
  const idsParam = Object.values(COINCAP_IDS).join(",");
  const url = `https://api.coincap.io/v2/assets?ids=${idsParam}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JetWallet/1.0'
      }
    });
    
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
    console.error('CoinCap fetch failed:', error);
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
    console.log('Fetching cryptocurrency prices...');
    
    // Try CoinGecko first
    try {
      const prices = await fetchFromCoinGecko();
      if (Object.keys(prices).length > 0) {
        console.log('CoinGecko prices fetched successfully:', prices);
        res.status(200).json({ 
          success: true, 
          data: prices, 
          source: 'coingecko',
          timestamp: Date.now()
        });
        return;
      }
    } catch (error) {
      console.warn('CoinGecko failed, trying CoinCap...', error.message);
    }

    // Try CoinCap as fallback
    try {
      const prices = await fetchFromCoinCap();
      if (Object.keys(prices).length > 0) {
        console.log('CoinCap prices fetched successfully:', prices);
        res.status(200).json({ 
          success: true, 
          data: prices, 
          source: 'coincap',
          timestamp: Date.now()
        });
        return;
      }
    } catch (error) {
      console.warn('CoinCap also failed:', error.message);
    }

    // If both APIs fail, return error (no fallback static prices)
    res.status(503).json({ 
      success: false, 
      error: 'All price APIs are currently unavailable. Please try again later.',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Price API handler error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      timestamp: Date.now()
    });
  }
}
