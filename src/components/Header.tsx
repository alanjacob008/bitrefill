import React from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onRefresh: () => void;
  lastUpdated: Date | null;
  loading: boolean;
  loadingDetails?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, lastUpdated, loading, loadingDetails = false }) => {
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Bitrefill Gift Card Monitor</h1>
          <p className="header-subtitle">Track gift card prices and commissions in real-time</p>
        </div>
        
        <div className="header-right">
          {lastUpdated && (
            <div className="last-updated">
              <Clock size={16} />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              {loadingDetails && (
                <span className="loading-details">• Loading detailed data...</span>
              )}
            </div>
          )}
          
          <button 
            className={`refresh-button ${loading ? 'loading' : ''}`}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
};
