export interface GiftCard {
  _id: string;
  name: string;
  baseName: string;
  _priceRange: string;
  _ratingValue: number;
  _reviewCount: number;
  currency: string;
  countryCode: string;
  label: string;
  categories: string[];
  iconPreview?: string;
  logoPreview?: string;
}

export interface Package {
  value: string;
  usdPrice: number;
  eurPrice: number;
  amount: number;
  eurValue: number;
}

export interface ProductDetails {
  _id: string;
  name: string;
  baseName: string;
  _priceRange: string;
  _ratingValue: number;
  _reviewCount: number;
  currency: string;
  countryCode: string;
  label: string;
  categories: string[];
  packages: Package[];
  outOfStock: boolean;
  iconPreview?: string;
  logoPreview?: string;
}

export interface FXRates {
  [currency: string]: {
    USD: number;
    EUR: number;
    BTC: number;
  };
}

export interface ProcessedGiftCard {
  productName: string;
  priceRange: string;
  usdRate: number;
  commission: string | CommissionDetail[];
  stockStatus: 'In Stock' | 'Out of Stock';
  ratingValue: number;
  reviewCount: number;
  categories: string[];
  iconPreview?: string;
  logoPreview?: string;
}

export interface CommissionDetail {
  packageValue: number;
  commissionRate: number;
  usdPriceInINR: number;
}
