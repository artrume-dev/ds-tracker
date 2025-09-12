import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

interface TokenCategory {
  type: 'raw' | 'foundation' | 'component';
  category: string;
  subcategory?: string;
  purpose: string;
}

interface CategorizedToken {
  tokenName: string;
  count: number;
  category: TokenCategory;
}

interface TokenCategoriesData {
  categorizedTokens: {
    raw: CategorizedToken[];
    foundation: CategorizedToken[];
    component: CategorizedToken[];
  };
  summary: {
    totalTokens: number;
    raw: number;
    foundation: number;
    component: number;
    mostUsedCategory: { type: string; usage: number };
  };
}

const TokenCategories: React.FC = () => {
  const [data, setData] = useState<TokenCategoriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'foundation' | 'component'>('foundation');

  useEffect(() => {
    fetchCategorizedTokens();
  }, []);

  const fetchCategorizedTokens = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getCategorizedTokens();
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch categorized tokens');
      }
    } catch (err) {
      setError('Error loading categorized tokens');
      console.error('Error fetching categorized tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'raw':
        return '🎨';
      case 'foundation':
        return '🏗️';
      case 'component':
        return '🧩';
      default:
        return '📦';
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'raw':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'foundation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'component':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTabButtonColor = (type: string, isActive: boolean) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
    if (isActive) {
      switch (type) {
        case 'raw':
          return `${baseClasses} bg-red-100 text-red-700 border border-red-200`;
        case 'foundation':
          return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`;
        case 'component':
          return `${baseClasses} bg-green-100 text-green-700 border border-green-200`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
      }
    }
    return `${baseClasses} bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>{error || 'Unable to load categorized tokens'}</p>
          <button 
            onClick={fetchCategorizedTokens}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentTokens = data.categorizedTokens[activeTab];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Token Categories</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {data.summary.totalTokens} tokens</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Raw Tokens</p>
                <p className="text-2xl font-bold text-red-700">{data.summary.raw}</p>
              </div>
              <span className="text-2xl">🎨</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Foundation</p>
                <p className="text-2xl font-bold text-blue-700">{data.summary.foundation}</p>
              </div>
              <span className="text-2xl">🏗️</span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Components</p>
                <p className="text-2xl font-bold text-green-700">{data.summary.component}</p>
              </div>
              <span className="text-2xl">🧩</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Most Used</p>
                <p className="text-lg font-bold text-purple-700 capitalize">{data.summary.mostUsedCategory.type}</p>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {(['raw', 'foundation', 'component'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={getTabButtonColor(tab, activeTab === tab)}
            >
              {getCategoryIcon(tab)} {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 bg-white px-2 py-0.5 rounded text-xs">
                {data.categorizedTokens[tab].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {currentTokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {activeTab} tokens found</p>
            </div>
          ) : (
            currentTokens.slice(0, 10).map((token, index) => (
              <div
                key={token.tokenName}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {token.tokenName}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(token.category.type)}`}>
                      {token.category.category}
                      {token.category.subcategory && ` / ${token.category.subcategory}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{token.category.purpose}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{token.count}</div>
                  <div className="text-xs text-gray-500">usages</div>
                </div>
              </div>
            ))
          )}
        </div>

        {currentTokens.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all {currentTokens.length} {activeTab} tokens →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenCategories;
