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
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('bitrefill_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('bitrefill_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (name: string) => {
    setFavorites(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadingDetails(false);
    setError(null);
    setGiftCards([]);

    try {
      // Fetch the product list and FX rates in parallel
      const [giftCardsResponse, fxRatesResponse] = await Promise.all([
        apiService.getGiftCards(),
        apiService.getFXRates(),
      ]);

      const processor = new DataProcessor(fxRatesResponse);

      // Show the table immediately with basic data (commission will show N/A until details load)
      const initialCards = giftCardsResponse.map((card) => {
        const processed = processor.processGiftCard(card);
        return { ...processed, isFavorite: favorites.includes(processed.productName) };
      });
      if (initialCards.length > 0) {
        setUsdRate(initialCards[0].usdRate);
      }
      setGiftCards(initialCards);
      setLastUpdated(new Date());
      setLoading(false);
      setLoadingDetails(true);

      // Fetch ALL product details in parallel
      const updatedCards = [...initialCards];

      await Promise.allSettled(
        giftCardsResponse.map((card, index) =>
          apiService.getProductDetails(card._id).then((detail) => {
            if (detail) {
              const processed = processor.processGiftCard(card, detail);
              updatedCards[index] = { 
                ...processed, 
                isFavorite: favorites.includes(processed.productName) 
              };
              setGiftCards([...updatedCards]);
            }
          })
        )
      );

      setLoadingDetails(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setLoading(false);
      setLoadingDetails(false);
    }
  }, [favorites]);

  useEffect(() => {
    setGiftCards(prev => prev.map(card => ({
      ...card,
      isFavorite: favorites.includes(card.productName)
    })));
  }, [favorites]);

  useEffect(() => {
    fetchData();
  }, []); // Only run once on mount

  return (
    <div className="app">
      <Header
        onRefresh={fetchData}
        lastUpdated={lastUpdated}
        loading={loading}
        loadingDetails={loadingDetails}
        usdRate={usdRate}
      />

      <main className="main-content">
        {loading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} onRetry={fetchData} />}
        {!loading && !error && (
          <GiftCardTable
            giftCards={giftCards}
            onRefresh={fetchData}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>
    </div>
  );
}

export default App;
