import React from 'react';
import { RefreshCw, Clock, DollarSign } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onRefresh: () => void;
  lastUpdated: Date | null;
  loading: boolean;
  loadingDetails?: boolean;
  usdRate?: number | null;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, lastUpdated, loading, loadingDetails = false, usdRate }) => {
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div className="bitrefill-logo">
             <span className="logo-text">bitrefill</span>
             <span className="country-tag">India</span>
          </div>
          {usdRate && (
            <div className="header-rate">
              <DollarSign size={14} />
              <span>1 USD = ₹{usdRate.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <div className="header-right">
          <div className="sync-status">
            {loadingDetails ? (
              <span className="syncing"><span className="dot"></span> Syncing</span>
            ) : lastUpdated ? (
              <span className="synced"><Clock size={14} /> {formatLastUpdated(lastUpdated)}</span>
            ) : null}
          </div>
          <button 
            className={`bitrefill-btn-primary ${loading ? 'loading' : ''}`}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Fetching' : 'Update Data'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
