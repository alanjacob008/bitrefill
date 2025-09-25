import axios from 'axios';
import { GiftCard, ProductDetails, FXRates } from '../types';

const API_BASE_URL = 'https://www.bitrefill.com/api';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Create axios instance with timeout and CORS handling
const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Add request interceptor for rate limiting
apiClient.interceptors.request.use(
  async (config) => {
    // Add a small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error - please check your internet connection');
    } else if (error.response?.status === 0) {
      throw new Error('CORS error - API not accessible from browser');
    } else if (error.response?.status >= 400) {
      throw new Error(`API error: ${error.response.status} ${error.response.statusText}`);
    }
    throw error;
  }
);

export const apiService = {
  // Fetch all gift cards for India
  async getGiftCards(): Promise<GiftCard[]> {
    try {
      const response = await apiClient.get(`${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/omni?c=all-gift-cards&country=IN`)}`);
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching gift cards:', error);
      throw new Error('Failed to fetch gift cards');
    }
  },

  // Fetch detailed product information
  async getProductDetails(productId: string): Promise<ProductDetails | null> {
    try {
      const response = await apiClient.get(`${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/product/${productId}`)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product details for ${productId}:`, error);
      return null;
    }
  },

  // Fetch FX rates
  async getFXRates(): Promise<FXRates> {
    try {
      const response = await apiClient.get(`${CORS_PROXY}${encodeURIComponent(`${API_BASE_URL}/accounts/fx_rates`)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching FX rates:', error);
      throw new Error('Failed to fetch FX rates');
    }
  },

  // Fetch all data with proper error handling and retries
  async fetchAllData(): Promise<{
    giftCards: GiftCard[];
    productDetails: Map<string, ProductDetails>;
    fxRates: FXRates;
  }> {
    try {
      // Fetch gift cards and FX rates in parallel
      const [giftCardsResponse, fxRatesResponse] = await Promise.all([
        this.getGiftCards(),
        this.getFXRates()
      ]);

      const giftCards = giftCardsResponse;
      const fxRates = fxRatesResponse;
      const productDetails = new Map<string, ProductDetails>();

      // Filter only INR products
      const inrProducts = giftCards.filter(card => card.currency === 'INR');

      // Fetch product details with rate limiting
      for (let i = 0; i < inrProducts.length; i++) {
        const product = inrProducts[i];
        try {
          const details = await this.getProductDetails(product._id);
          if (details) {
            productDetails.set(product._id, details);
          }
          
          // Add delay between requests to respect rate limits
          if (i < inrProducts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (error) {
          console.error(`Failed to fetch details for ${product._id}:`, error);
        }
      }

      return {
        giftCards: inrProducts,
        productDetails,
        fxRates
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw error;
    }
  }
};
