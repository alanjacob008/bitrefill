import axios from 'axios';
import { GiftCard, ProductDetails, FXRates } from '../types';

const API_BASE_URL = 'https://www.bitrefill.com/api';

// CORS proxy strategies, tried in order on failure.
// corsproxy.io is primary (fastest, most reliable in testing).
// allorigins.win/get is fallback (wraps response in {contents: '...'}).
const PROXY_STRATEGIES = [
  {
    wrap: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    unwrap: (data: any) => data,
  },
  {
    wrap: (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    unwrap: (data: any) => {
      if (typeof data?.contents === 'string') return JSON.parse(data.contents);
      throw new Error('allorigins returned no contents');
    },
  },
];

const apiClient = axios.create({
  timeout: 12000,
  headers: { 'Accept': 'application/json' },
  withCredentials: false,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error - please check your internet connection');
    }
    if (error.response?.status >= 400) {
      throw new Error(`API error: ${error.response.status} ${error.response.statusText}`);
    }
    throw error;
  }
);

/**
 * Fetches a Bitrefill API URL through CORS proxies with automatic fallback.
 * Tries each proxy strategy in order and returns on the first success.
 */
async function fetchViaProxy<T = any>(targetUrl: string): Promise<T> {
  let lastError: unknown;

  for (const strategy of PROXY_STRATEGIES) {
    try {
      const response = await apiClient.get(strategy.wrap(targetUrl));
      return strategy.unwrap(response.data) as T;
    } catch (err) {
      console.warn(`Proxy strategy failed for ${targetUrl}:`, err);
      lastError = err;
    }
  }

  throw lastError ?? new Error(`All CORS proxies failed for: ${targetUrl}`);
}

export const apiService = {
  async getGiftCards(): Promise<GiftCard[]> {
    const data = await fetchViaProxy<{ products: GiftCard[] }>(
      `${API_BASE_URL}/omni?c=all-gift-cards&country=IN`
    );
    return (data.products ?? []).filter((card) => card.currency === 'INR');
  },

  async getProductDetails(productId: string): Promise<ProductDetails | null> {
    try {
      return await fetchViaProxy<ProductDetails>(`${API_BASE_URL}/product/${productId}`);
    } catch (error) {
      console.warn(`Failed to fetch details for ${productId}:`, error);
      return null;
    }
  },

  async getFXRates(): Promise<FXRates> {
    return fetchViaProxy<FXRates>(`${API_BASE_URL}/accounts/fx_rates`);
  },
};
