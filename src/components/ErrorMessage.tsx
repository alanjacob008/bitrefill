import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <AlertCircle className="error-icon" size={48} />
        <h3>Something went wrong</h3>
        <p className="error-message">{message}</p>
        <button className="retry-button" onClick={onRetry}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
};
