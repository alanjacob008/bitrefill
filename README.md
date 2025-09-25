# Bitrefill Gift Card Monitor

A React application that monitors Bitrefill gift card prices and calculates commissions in real-time.

## Features

- **Real-time Data**: Fetches live gift card data from Bitrefill APIs
- **Commission Calculation**: Automatically calculates commission rates for different packages
- **Interactive Table**: Sortable and filterable table with search functionality
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-refresh**: Manual refresh button to get latest data
- **Error Handling**: Graceful error handling with retry functionality

## Table Columns

- **Product Name**: Gift card name with category tags
- **Price Range**: Available price range in INR
- **USD Rate**: Current INR to USD conversion rate
- **Commission**: Calculated commission percentage for packages
- **Stock Status**: In Stock or Out of Stock status
- **Rating**: User rating with star display
- **Reviews**: Number of reviews

## Commission Calculation

The commission is calculated using the formula:
```
Commission = (USD Price in INR - Package Value) / Package Value × 100
```

Where:
- USD Price in INR = USD Price × INR to USD conversion rate
- Package Value = The gift card value in INR

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## API Endpoints Used

- `https://www.bitrefill.com/api/omni?c=all-gift-cards&country=IN` - Get all gift cards for India
- `https://www.bitrefill.com/api/product/{productId}` - Get detailed product information
- `https://www.bitrefill.com/api/accounts/fx_rates` - Get current FX rates

## Rate Limiting

The application includes built-in rate limiting to respect API limits:
- 100ms delay between requests
- 200ms delay between product detail requests
- Retry logic for failed requests

## Technologies Used

- React 18 with TypeScript
- Axios for API calls
- Lucide React for icons
- CSS3 for styling
- Responsive design principles

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
