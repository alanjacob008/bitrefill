import { GiftCard, ProductDetails, FXRates, ProcessedGiftCard, CommissionDetail } from '../types';
import { getHighResLogo } from './brandLogos';

export class DataProcessor {
  private fxRates: FXRates;
  private inrToUsdRate: number;

  constructor(fxRates: FXRates) {
    this.fxRates = fxRates;
    // Calculate INR to USD rate: 1 USD = 1 / INR_USD_RATE
    this.inrToUsdRate = 1 / fxRates.INR.USD;
  }

  processGiftCard(giftCard: GiftCard, productDetails?: ProductDetails): ProcessedGiftCard {
    const usdRate = this.calculateUSDRate();
    const commission = this.calculateCommission(productDetails);
    const stockStatus = this.determineStockStatus(giftCard, productDetails);
    const bestDealScore = this.calculateBestDealScore(commission, giftCard._ratingValue);

    // Prioritize high-res logo from mapping, then logoPreview, then iconPreview
    const highResLogo = getHighResLogo(giftCard.name);
    const finalIcon = highResLogo || giftCard.logoPreview || giftCard.iconPreview;

    return {
      productName: giftCard.name,
      priceRange: giftCard._priceRange,
      usdRate,
      commission,
      stockStatus,
      ratingValue: giftCard._ratingValue,
      reviewCount: giftCard._reviewCount,
      categories: giftCard.categories,
      iconPreview: finalIcon,
      logoPreview: highResLogo || giftCard.logoPreview,
      bestDealScore
    };
  }

  private calculateBestDealScore(commission: string | CommissionDetail[], rating: number): number {
    let commissionVal = 5; // Default average

    if (typeof commission === 'string') {
      if (commission === 'N/A') commissionVal = 5;
      else commissionVal = parseFloat(commission.replace('%', ''));
    } else if (Array.isArray(commission) && commission.length > 0) {
      // Use the average commission rate from all packages
      const sum = commission.reduce((acc, c) => acc + c.commissionRate, 0);
      commissionVal = sum / commission.length;
    }

    // Best deal score formula: (10 - commissionVal) * 0.7 + (rating * 0.3)
    // Lower commission and higher rating = higher score
    const commissionScore = Math.max(0, 10 - commissionVal);
    const normalizedRating = rating || 0;
    
    return Math.round(((commissionScore * 0.7) + (normalizedRating * 0.3)) * 10) / 10;
  }

  private calculateUSDRate(): number {
    return this.inrToUsdRate;
  }

  private calculateCommission(productDetails?: ProductDetails): string | CommissionDetail[] {
    if (!productDetails || !productDetails.packages || productDetails.packages.length === 0) {
      return 'N/A';
    }

    const commissions: CommissionDetail[] = [];

    for (const pkg of productDetails.packages) {
      // Use pkg.amount (always numeric) instead of parseInt(pkg.value).
      // Some products (e.g. Uber Vouchers) have value like 'egift 100' which
      // would produce NaN, while amount is always the clean numeric denomination.
      const packageValue = pkg.amount;
      if (!packageValue || packageValue <= 0) continue;

      // Use prices.INR (in paise, divide by 100) when available — more accurate than
      // USD price × market FX rate, since it reflects Bitrefill's actual INR pricing.
      // Fall back to USD conversion if prices.INR is missing.
      const costInINR = pkg.prices?.INR != null
        ? pkg.prices.INR / 100
        : pkg.usdPrice * this.inrToUsdRate;

      // Commission: how much extra you pay vs face value, as a percentage
      const commissionRate = ((costInINR - packageValue) / packageValue) * 100;

      commissions.push({
        packageValue,
        commissionRate: Math.round(commissionRate * 100) / 100,
        usdPriceInINR: Math.round(costInINR * 100) / 100
      });
    }

    // If all packages have the same commission rate, return a single string
    const uniqueRates = Array.from(new Set(commissions.map(c => c.commissionRate)));
    if (uniqueRates.length === 1) {
      return `${commissions[0].commissionRate}%`;
    }

    // If different rates, return array of details
    return commissions;
  }

  private determineStockStatus(giftCard: GiftCard, productDetails?: ProductDetails): 'In Stock' | 'Out of Stock' {
    // Check label first
    if (giftCard.label === 'out_of_stock') {
      return 'Out of Stock';
    }

    // Check product details
    if (productDetails?.outOfStock) {
      return 'Out of Stock';
    }

    return 'In Stock';
  }

  formatCommission(commission: string | CommissionDetail[]): string {
    if (typeof commission === 'string') {
      return commission;
    }

    if (commission.length === 0) {
      return 'N/A';
    }

    if (commission.length === 1) {
      return `${commission[0].commissionRate}%`;
    }

    // Find min and max for range display
    const rates = commission.map(c => c.commissionRate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);

    if (min === max) return `${min}%`;
    return `${min}% - ${max}%`;
  }

  getBestPackage(commission: string | CommissionDetail[]): CommissionDetail | null {
    if (typeof commission === 'string' || commission.length === 0) return null;
    return [...commission].sort((a, b) => a.commissionRate - b.commissionRate)[0];
  }

  getCommissionTooltip(commission: string | CommissionDetail[]): string {
    if (typeof commission === 'string') {
      return commission;
    }

    if (commission.length === 0) {
      return 'No package data available';
    }

    return commission.map(c => 
      `${c.packageValue}₹ package: ${c.usdPriceInINR}₹ (${c.commissionRate}% commission)`
    ).join('\n');
  }
}
