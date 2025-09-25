import React, { useState, useEffect, useCallback } from 'react';
import { GiftCardTable } from './components/GiftCardTable';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Header } from './components/Header';
import { apiService } from './services/api';
import { DataProcessor } from './utils/dataProcessor';
import { ProcessedGiftCard } from './types';
import './App.css';

function App() {
  const [giftCards, setGiftCards] = useState<ProcessedGiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGiftCards([]); // Clear existing data
    
    try {
      // Start with basic gift card data and FX rates first
      const [giftCardsResponse, fxRatesResponse] = await Promise.all([
        apiService.getGiftCards(),
        apiService.getFXRates()
      ]);
      
      // Process initial gift cards without detailed product info
      const processor = new DataProcessor(fxRatesResponse);
      const initialProcessedCards = giftCardsResponse.map(giftCard => 
        processor.processGiftCard(giftCard)
      );
      
      setGiftCards(initialProcessedCards);
      setLastUpdated(new Date());
      setLoading(false);
      setLoadingDetails(true);
      
      // Now fetch detailed product information in the background
      // and update cards as we get the data
      const updatedCards = [...initialProcessedCards];
      
      // Process products in batches to avoid overwhelming the API
      const batchSize = 5;
      const productIds = giftCardsResponse.map(card => card._id);
      
      for (let i = 0; i < productIds.length; i += batchSize) {
        const batch = productIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (productId) => {
          try {
            const productDetail = await apiService.getProductDetails(productId);
            if (productDetail) {
              // Update the specific card with detailed information
              const cardIndex = updatedCards.findIndex(card => 
                card.productName === giftCardsResponse.find(gc => gc._id === productId)?.name
              );
              
              if (cardIndex !== -1) {
                const originalCard = giftCardsResponse.find(gc => gc._id === productId);
                if (originalCard) {
                  updatedCards[cardIndex] = processor.processGiftCard(originalCard, productDetail);
                  setGiftCards([...updatedCards]); // Update UI immediately
                }
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch details for ${productId}:`, error);
            // Continue with other products even if one fails
          }
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches to be respectful to the API
        if (i + batchSize < productIds.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setLoadingDetails(false);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="app">
      <Header 
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
        loading={loading}
        loadingDetails={loadingDetails}
      />
      
      <main className="main-content">
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={handleRefresh} />}
        {!loading && !error && (
          <GiftCardTable 
            giftCards={giftCards}
            onRefresh={handleRefresh}
          />
        )}
      </main>
    </div>
  );
}

export default App;
