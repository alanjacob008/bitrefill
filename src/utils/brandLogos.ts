/**
 * Maps Bitrefill product names to their brand domains.
 * Used to fetch high-resolution logos via the Google Favicon API (128×128 PNG).
 *
 * Tested: all 25 domains return real images via:
 *   https://www.google.com/s2/favicons?domain={domain}&sz=128
 */
const BRAND_DOMAINS: Record<string, string> = {
  // — exact Bitrefill product names —
  'AJIO India':                    'ajio.com',
  'App Store & iTunes India':      'apple.com',
  'Bigbasket India':               'bigbasket.com',
  'Blink it India':                'blinkit.com',
  'BlueStone Gold Jewellery India':'bluestone.com',
  'BookMyShow India':              'bookmyshow.com',
  'Cleartrip India':               'cleartrip.com',
  'Dominos India':                 'dominos.co.in',
  'Ease My Trip India':            'easemytrip.com',
  'Flipkart India':                'flipkart.com',
  'Google Play India':             'play.google.com',
  'Hindustan Petroleum India':     'hindustanpetroleum.com',
  'MakeMyTrip India':              'makemytrip.com',
  'Phonepe India':                 'phonepe.com',
  'PlayStation Store India':       'playstation.com',
  'Reliance JioMart India':        'jiomart.com',
  'Shoppers Stop India':           'shoppersstop.com',
  'Steam India':                   'store.steampowered.com',
  'Swiggy Money India':            'swiggy.com',
  'Tanishq Gold Coin India':       'tanishq.co.in',
  'Tanishq Gold Jewellery India':  'tanishq.co.in',
  'Uber Vouchers India':           'uber.com',
  'UniPin Voucher India':          'unipin.com',
  'Valorant India':                'playvalorant.com',
  'Zomato India':                  'zomato.com',
};

/**
 * Returns a 128×128 high-res logo URL for a brand by name.
 * Falls back to fuzzy matching (e.g. "Zomato India" matches "Zomato").
 * Returns empty string if no domain is found — caller should fall back
 * to the Bitrefill API's base64 iconPreview.
 */
export function getHighResLogo(name: string): string {
  // Exact match first
  const exact = BRAND_DOMAINS[name];
  if (exact) return logoUrl(exact);

  // Fuzzy match — check if any key is a substring of the product name
  for (const [key, domain] of Object.entries(BRAND_DOMAINS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return logoUrl(domain);
    }
  }

  return '';
}

function logoUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
