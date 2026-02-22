import React, { useState, useMemo } from 'react';
import { Star, Package, TrendingUp, TrendingDown, Heart, LayoutGrid, List, Search, X } from 'lucide-react';
import { ProcessedGiftCard } from '../types';
import { DataProcessor } from '../utils/dataProcessor';
import './GiftCardTable.css';

interface GiftCardTableProps {
  giftCards: ProcessedGiftCard[];
  onRefresh: () => void;
  onToggleFavorite: (name: string) => void;
}

type SortField = 'productName' | 'ratingValue' | 'reviewCount' | 'commission' | 'bestDealScore';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

const processor = new DataProcessor({
  INR: { USD: 0.0113279148140806, EUR: 0.00965423805612982, BTC: 9.80977199104788e-8 },
});

const LogoImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="logo-container">
      {loading && !error && <div className="skeleton-logo" />}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : 'visible'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        style={error ? { display: 'none' } : {}}
      />
      {error && <div className="card-logo-placeholder">{alt[0]}</div>}
    </div>
  );
};

export const GiftCardTable: React.FC<GiftCardTableProps> = ({ giftCards, onRefresh, onToggleFavorite }) => {
  const [sortField, setSortField] = useState<SortField>('bestDealScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [hideOutOfStock, setHideOutOfStock] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Close tooltip on click outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    if (activeTooltip) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeTooltip]);

  const categories = useMemo(() => {
    const all = giftCards.flatMap((c) => c.categories);
    return ['all', ...Array.from(new Set(all))];
  }, [giftCards]);

  const stats = useMemo(() => {
    const inStock = giftCards.filter((c) => c.stockStatus === 'In Stock');
    const total = inStock.length || 1;
    const avgCommission =
      inStock.reduce((acc, c) => {
        const val =
          typeof c.commission === 'string'
            ? c.commission === 'N/A'
              ? 0
              : parseFloat(c.commission)
            : c.commission[0]?.commissionRate || 0;
        return acc + val;
      }, 0) / total;

    const bestDeal = [...inStock].sort((a, b) => (b.bestDealScore || 0) - (a.bestDealScore || 0))[0];

    return {
      avgCommission: avgCommission.toFixed(2),
      activeProducts: inStock.length,
      bestDeal: bestDeal?.productName || 'N/A',
    };
  }, [giftCards]);

  const filteredAndSortedCards = useMemo(() => {
    const filtered = giftCards.filter((card) => {
      const matchesSearch = card.productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || card.categories.includes(selectedCategory);
      const matchesStock = !hideOutOfStock || card.stockStatus === 'In Stock';
      return matchesSearch && matchesCategory && matchesStock;
    });

    return filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'commission') {
        aValue =
          typeof a.commission === 'string'
            ? a.commission === 'N/A' ? 99 : parseFloat(a.commission)
            : a.commission[0]?.commissionRate ?? 99;
        bValue =
          typeof b.commission === 'string'
            ? b.commission === 'N/A' ? 99 : parseFloat(b.commission)
            : b.commission[0]?.commissionRate ?? 99;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [giftCards, searchTerm, selectedCategory, sortField, sortDirection, hideOutOfStock]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'productName' ? 'asc' : 'desc');
    }
  };

  const getCommissionColor = (commission: string | any[]) => {
    if (typeof commission === 'string' && commission === 'N/A') return '';
    const val =
      typeof commission === 'string'
        ? parseFloat(commission)
        : commission[0]?.commissionRate ?? 5;
    if (val <= 2) return 'low';
    if (val <= 5) return 'medium';
    return 'high';
  };

  const renderCommissionBadge = (card: ProcessedGiftCard) => {
    const { commission, productName } = card;
    const formatted = processor.formatCommission(commission);
    const colorClass = getCommissionColor(commission);
    const bestPackage = processor.getBestPackage(commission);
    const isOpen = activeTooltip === productName;
    
    return (
      <div className="commission-container">
        <div 
          className={`commission-badge ${colorClass} clickable ${isOpen ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTooltip(isOpen ? null : productName);
          }}
        >
          {formatted}
        </div>
        {bestPackage && Array.isArray(commission) && commission.length > 1 && (
          <div className="best-package-tag">
            Best: {bestPackage.commissionRate}% @ ₹{bestPackage.packageValue}
          </div>
        )}
        
        {/* Persistent Detailed Tooltip */}
        {isOpen && Array.isArray(commission) && commission.length > 0 && (
          <div className="commission-tooltip persistent" onClick={(e) => e.stopPropagation()}>
            <div className="tooltip-header">
              <span className="tooltip-title">Price Breakdown</span>
              <button className="close-tooltip" onClick={() => setActiveTooltip(null)}>
                <X size={14} />
              </button>
            </div>
            <div className="tooltip-table">
              <div className="tooltip-row label-row">
                <span>Voucher</span>
                <span>Cost</span>
                <span>Fee</span>
              </div>
              {commission.sort((a,b) => a.packageValue - b.packageValue).map((pkg, i) => (
                <div key={i} className={`tooltip-row data-row ${pkg.commissionRate === bestPackage?.commissionRate ? 'best' : ''}`}>
                  <span className="pkg-val">₹{pkg.packageValue}</span>
                  <span className="pkg-cost">₹{pkg.usdPriceInINR.toFixed(0)}</span>
                  <span className={`pkg-fee ${pkg.commissionRate <= 2 ? 'low' : pkg.commissionRate > 5 ? 'high' : 'med'}`}>
                    {pkg.commissionRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDealScore = (score: number = 0) => (
    <div className="deal-score">
      <div className="score-value">{score.toFixed(1)}</div>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${Math.min(score * 10, 100)}%` }} />
      </div>
    </div>
  );

  const sortIcon = (field: SortField) =>
    sortField === field ? (
      sortDirection === 'asc' ? <TrendingUp size={14} /> : <TrendingDown size={14} />
    ) : null;

  return (
    <div className="table-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Avg Commission</div>
          <div className="stat-value">{stats.avgCommission}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Products</div>
          <div className="stat-value">{stats.activeProducts}</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-label">Best Value Now</div>
          <div className="stat-value">{stats.bestDeal}</div>
        </div>
      </div>

      <div className="table-header">
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <div className="select-wrapper">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <label className="toggle-control">
              <input
                type="checkbox"
                className="toggle-input"
                checked={hideOutOfStock}
                onChange={() => setHideOutOfStock(!hideOutOfStock)}
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">In Stock Only</span>
            </label>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={20} />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-wrapper">
          <table className="gift-card-table">
            <thead>
              <tr>
                <th className="pin-col" />
                <th className="sortable" onClick={() => handleSort('productName')}>
                  Brand {sortIcon('productName')}
                </th>
                <th className="sortable" onClick={() => handleSort('commission')}>
                  Commission {sortIcon('commission')}
                </th>
                <th>Price Range</th>
                <th className="sortable" onClick={() => handleSort('bestDealScore')}>
                  Value Score {sortIcon('bestDealScore')}
                </th>
                <th className="sortable" onClick={() => handleSort('ratingValue')}>
                  Rating {sortIcon('ratingValue')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCards.map((card) => (
                <tr key={card.productName} className={`table-row ${card.isFavorite ? 'favorite' : ''}`}>
                  <td className="pin-col">
                    <button
                      className={`favorite-btn ${card.isFavorite ? 'active' : ''}`}
                      onClick={() => onToggleFavorite(card.productName)}
                      title={card.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={18} fill={card.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                                      <td className="product-cell">
                                        <div className="product-info">
                                          {card.iconPreview && (
                                            <LogoImage
                                              src={card.iconPreview}
                                              alt={card.productName}
                                              className="product-icon"
                                            />
                                          )}
                                          <div>
                  
                        <div className="product-name">{card.productName}</div>
                        <div className="product-categories">
                          {card.categories.slice(0, 1).map((cat) => (
                            <span key={cat} className="category-tag">{cat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{renderCommissionBadge(card)}</td>
                  <td className="price-range">{card.priceRange}</td>
                  <td>{renderDealScore(card.bestDealScore)}</td>
                  <td className="rating-cell">
                    <div className="rating">
                      <Star size={14} className="star-icon" fill="currentColor" />
                      <span>{card.ratingValue.toFixed(1)}</span>
                      <span className="review-count">({card.reviewCount})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-wrapper">
          {filteredAndSortedCards.map((card) => (
            <div key={card.productName} className={`card-item ${card.isFavorite ? 'favorite' : ''}`}>
              <div className="card-header">
                {card.logoPreview || card.iconPreview ? (
                  <LogoImage 
                    src={card.logoPreview || card.iconPreview || ""} 
                    alt={card.productName} 
                    className="card-logo" 
                  />
                ) : (
                  <div className="card-logo-placeholder">{card.productName[0]}</div>
                )}
                <button
                  className={`favorite-btn ${card.isFavorite ? 'active' : ''}`}
                  onClick={() => onToggleFavorite(card.productName)}
                  title={card.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={20} fill={card.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="card-body">
                <h3 className="card-title">{card.productName}</h3>
                <div className="card-tags">
                  {card.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="category-tag">{cat}</span>
                  ))}
                </div>

                <div className="card-metrics">
                  <div className="metric">
                    <span className="label">Commission</span>
                    {renderCommissionBadge(card)}
                  </div>
                  <div className="metric">
                    <span className="label">Deal Score</span>
                    {renderDealScore(card.bestDealScore)}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="rating">
                  <Star size={14} fill="currentColor" />
                  <span>{card.ratingValue.toFixed(1)} ({card.reviewCount})</span>
                </div>
                <div className="price">{card.priceRange}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAndSortedCards.length === 0 && (
        <div className="no-results">
          <Package size={48} />
          <h3>No gift cards found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
