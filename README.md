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

## Live Demo

Visit the live application: [https://yourusername.github.io/bitrefill](https://yourusername.github.io/bitrefill)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bitrefill.git
cd bitrefill
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

### First-time Setup

1. **Update the homepage URL** in `package.json`:
   - Replace `yourusername` with your actual GitHub username
   - Replace `bitrefill` with your actual repository name

2. **Create a GitHub repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README (since we already have one)

3. **Push your code to GitHub**:
```bash
git remote add origin https://github.com/yourusername/bitrefill.git
git branch -M main
git push -u origin main
```

4. **Deploy to GitHub Pages**:
```bash
npm run deploy
```

### Subsequent Deployments

For future updates, simply run:
```bash
npm run deploy
```

This will:
- Build the production version
- Deploy it to the `gh-pages` branch
- Make it available at your GitHub Pages URL

### GitHub Pages Configuration

After the first deployment:
1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "Deploy from a branch"
4. Select "gh-pages" branch and "/ (root)" folder
5. Click "Save"

Your site will be available at: `https://yourusername.github.io/bitrefill`

## Build

To create a production build:
```bash
npm run build
```

This builds the app for production to the `build` folder.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run deploy` - Deploys the app to GitHub Pages

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
