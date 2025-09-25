import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <Loader2 className="spinner" size={48} />
        <h3>Loading Gift Card Data</h3>
        <p>Fetching the latest prices and commission data...</p>
      </div>
    </div>
  );
};
