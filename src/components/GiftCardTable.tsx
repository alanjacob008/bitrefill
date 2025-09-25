import React, { useState, useMemo } from 'react';
import { Star, Package, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { ProcessedGiftCard } from '../types';
import { DataProcessor } from '../utils/dataProcessor';
import './GiftCardTable.css';

interface GiftCardTableProps {
  giftCards: ProcessedGiftCard[];
  onRefresh: () => void;
}

type SortField = 'productName' | 'ratingValue' | 'reviewCount' | 'commission';
type SortDirection = 'asc' | 'desc';

export const GiftCardTable: React.FC<GiftCardTableProps> = ({ giftCards, onRefresh }) => {
  const [sortField, setSortField] = useState<SortField>('productName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const processor = new DataProcessor({ INR: { USD: 0.0113279148140806, EUR: 0.00965423805612982, BTC: 9.80977199104788e-8 } });

  // Get unique categories
  const categories = useMemo(() => {
    const allCategories = giftCards.flatMap(card => card.categories);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [giftCards]);

  // Filter and sort data
  const filteredAndSortedCards = useMemo(() => {
    let filtered = giftCards.filter(card => {
      const matchesSearch = card.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || card.categories.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle commission sorting
      if (sortField === 'commission') {
        aValue = typeof a.commission === 'string' ? 
          (a.commission === 'N/A' ? -1 : parseFloat(a.commission)) : 
          (Array.isArray(a.commission) ? a.commission[0]?.commissionRate || -1 : -1);
        bValue = typeof b.commission === 'string' ? 
          (b.commission === 'N/A' ? -1 : parseFloat(b.commission)) : 
          (Array.isArray(b.commission) ? b.commission[0]?.commissionRate || -1 : -1);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [giftCards, searchTerm, selectedCategory, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderCommission = (commission: string | any[]) => {
    const formatted = processor.formatCommission(commission);
    const tooltip = processor.getCommissionTooltip(commission);
    
    return (
      <div className="commission-cell">
        <span className="commission-value">{formatted}</span>
        {Array.isArray(commission) && commission.length > 1 && (
          <Info size={14} className="commission-info" />
        )}
      </div>
    );
  };

  const renderStockStatus = (status: 'In Stock' | 'Out of Stock') => {
    return (
      <span className={`stock-status ${status.toLowerCase().replace(' ', '-')}`}>
        {status === 'In Stock' ? '✓ In Stock' : '✗ Out of Stock'}
      </span>
    );
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="table-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search gift cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="table-info">
          <span>Showing {filteredAndSortedCards.length} of {giftCards.length} gift cards</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="gift-card-table">
          <thead>
            <tr>
              <th 
                className="sortable" 
                onClick={() => handleSort('productName')}
              >
                Product Name
                {sortField === 'productName' && (
                  sortDirection === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
                )}
              </th>
              <th>Price Range</th>
              <th>USD Rate</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('commission')}
              >
                Commission
                {sortField === 'commission' && (
                  sortDirection === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
                )}
              </th>
              <th>Stock Status</th>
              <th 
                className="sortable" 
                onClick={() => handleSort('ratingValue')}
              >
                Rating
                {sortField === 'ratingValue' && (
                  sortDirection === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
                )}
              </th>
              <th 
                className="sortable" 
                onClick={() => handleSort('reviewCount')}
              >
                Reviews
                {sortField === 'reviewCount' && (
                  sortDirection === 'asc' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCards.map((card, index) => (
              <tr key={`${card.productName}-${index}`} className="table-row">
                <td className="product-cell">
                  <div className="product-info">
                    {card.iconPreview && (
                      <img 
                        src={card.iconPreview} 
                        alt={card.productName}
                        className="product-icon"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="product-name">{card.productName}</div>
                      <div className="product-categories">
                        {card.categories.slice(0, 2).map(category => (
                          <span key={category} className="category-tag">
                            {category}
                          </span>
                        ))}
                        {card.categories.length > 2 && (
                          <span className="category-tag more">
                            +{card.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="price-range">{card.priceRange}</td>
                <td className="usd-rate">₹{card.usdRate.toFixed(4)}</td>
                <td className="commission-cell">
                  {renderCommission(card.commission)}
                </td>
                <td>{renderStockStatus(card.stockStatus)}</td>
                <td className="rating-cell">
                  <div className="rating">
                    <Star size={16} className="star-icon" />
                    <span>{card.ratingValue.toFixed(1)}</span>
                  </div>
                </td>
                <td className="review-count">{card.reviewCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedCards.length === 0 && (
        <div className="no-results">
          <Package size={48} />
          <h3>No gift cards found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};
