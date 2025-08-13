import { CoinID } from "../types";

// Interface for the API response
interface PriceApiResponse {
  success: boolean;
  data?: Record<string, number>;
  error?: string;
  source?: string;
  timestamp?: number;
}

// Main function to fetch live cryptocurrency prices via Vercel API
export async function fetchLivePrices(): Promise<Partial<Record<CoinID, number>>> {
  try {
    // Use relative URL for Vercel deployment, absolute for development
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/prices'
      : '/api/prices';
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result: PriceApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API returned unsuccessful response');
    }

    if (!result.data || Object.keys(result.data).length === 0) {
      throw new Error('No price data received from API');
    }

    // Convert the response data to our CoinID format
    const prices: Partial<Record<CoinID, number>> = {};
    
    Object.entries(result.data).forEach(([key, price]) => {
      if (key in CoinID && typeof price === 'number' && price > 0) {
        prices[key as CoinID] = price;
      }
    });

    return prices;

  } catch (error) {
    // Instead of fallback static prices, throw error to let UI handle it
    throw new Error(`Unable to fetch live cryptocurrency prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
