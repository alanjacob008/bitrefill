import { GiftCard, ProductDetails, FXRates, ProcessedGiftCard, CommissionDetail } from '../types';

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

    return {
      productName: giftCard.name,
      priceRange: giftCard._priceRange,
      usdRate,
      commission,
      stockStatus,
      ratingValue: giftCard._ratingValue,
      reviewCount: giftCard._reviewCount,
      categories: giftCard.categories,
      iconPreview: giftCard.iconPreview,
      logoPreview: giftCard.logoPreview
    };
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
      const packageValue = parseInt(pkg.value);
      const usdPrice = pkg.usdPrice;
      
      // Convert USD price to INR using the FX rate
      const usdPriceInINR = usdPrice * this.inrToUsdRate;
      
      // Calculate commission: (USD Price in INR - Package Value) / Package Value * 100
      const commissionRate = ((usdPriceInINR - packageValue) / packageValue) * 100;
      
      commissions.push({
        packageValue,
        commissionRate: Math.round(commissionRate * 100) / 100, // Round to 2 decimal places
        usdPriceInINR: Math.round(usdPriceInINR * 100) / 100
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

    // Multiple packages with different rates
    return commission.map(c => `${c.packageValue}₹: ${c.commissionRate}%`).join(', ');
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
