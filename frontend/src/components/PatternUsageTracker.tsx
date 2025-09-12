import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

interface PatternUsage {
  patternName: string;
  type: 'component' | 'mixin' | 'utility';
  tokensUsed: {
    raw: string[];
    foundation: string[];
    component: string[];
  };
  count: number;
}

interface PatternUsageData {
  patterns: {
    components: PatternUsage[];
    mixins: PatternUsage[];
    utilities: PatternUsage[];
  };
  summary: {
    totalPatterns: number;
    componentsCount: number;
    mixinsCount: number;
    utilitiesCount: number;
    mostUsedPattern: PatternUsage | null;
  };
}

const PatternUsageTracker: React.FC = () => {
  const [data, setData] = useState<PatternUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'mixins' | 'utilities'>('components');
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);

  useEffect(() => {
    fetchPatternUsage();
  }, []);

  const fetchPatternUsage = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getPatterns();
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch pattern usage data');
      }
    } catch (err) {
      setError('Error loading pattern usage');
      console.error('Error fetching pattern usage:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'component':
        return '🧩';
      case 'mixin':
        return '⚙️';
      case 'utility':
        return '🔧';
      default:
        return '📦';
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'component':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'mixin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'utility':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTabButtonColor = (type: string, isActive: boolean) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
    if (isActive) {
      switch (type) {
        case 'components':
          return `${baseClasses} bg-green-100 text-green-700 border border-green-200`;
        case 'mixins':
          return `${baseClasses} bg-purple-100 text-purple-700 border border-purple-200`;
        case 'utilities':
          return `${baseClasses} bg-orange-100 text-orange-700 border border-orange-200`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
      }
    }
    return `${baseClasses} bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200`;
  };

  const getTokenTypeColor = (type: 'raw' | 'foundation' | 'component') => {
    switch (type) {
      case 'raw':
        return 'bg-red-100 text-red-700';
      case 'foundation':
        return 'bg-blue-100 text-blue-700';
      case 'component':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const togglePatternExpansion = (patternName: string) => {
    setExpandedPattern(expandedPattern === patternName ? null : patternName);
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
          <p>{error || 'Unable to load pattern usage data'}</p>
          <button 
            onClick={fetchPatternUsage}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentPatterns = data.patterns[activeTab];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pattern Usage</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {data.summary.totalPatterns} patterns</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Components</p>
                <p className="text-2xl font-bold text-green-700">{data.summary.componentsCount}</p>
              </div>
              <span className="text-2xl">🧩</span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Mixins</p>
                <p className="text-2xl font-bold text-purple-700">{data.summary.mixinsCount}</p>
              </div>
              <span className="text-2xl">⚙️</span>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Utilities</p>
                <p className="text-2xl font-bold text-orange-700">{data.summary.utilitiesCount}</p>
              </div>
              <span className="text-2xl">🔧</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Top Pattern</p>
                <p className="text-sm font-bold text-blue-700 truncate">
                  {data.summary.mostUsedPattern?.patternName || 'N/A'}
                </p>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          {(['components', 'mixins', 'utilities'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={getTabButtonColor(tab, activeTab === tab)}
            >
              {getPatternIcon(tab.slice(0, -1))} {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 bg-white px-2 py-0.5 rounded text-xs">
                {data.patterns[tab].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {currentPatterns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {activeTab} found</p>
              <p className="text-sm mt-1">Run a scan to detect patterns</p>
            </div>
          ) : (
            currentPatterns.slice(0, 10).map((pattern, index) => (
              <div
                key={pattern.patternName}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => togglePatternExpansion(pattern.patternName)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getPatternIcon(pattern.type)}</span>
                      <span className="font-medium text-gray-900">{pattern.patternName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPatternColor(pattern.type)}`}>
                        {pattern.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Uses {Object.values(pattern.tokensUsed).flat().length} tokens</span>
                      <span>{pattern.count} usages</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{pattern.count}</div>
                      <div className="text-xs text-gray-500">usages</div>
                    </div>
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        expandedPattern === pattern.patternName ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedPattern === pattern.patternName && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <h4 className="font-medium text-gray-900 mb-3">Token Dependencies:</h4>
                    <div className="space-y-3">
                      {(['raw', 'foundation', 'component'] as const).map((tokenType) => {
                        const tokens = pattern.tokensUsed[tokenType];
                        if (tokens.length === 0) return null;

                        return (
                          <div key={tokenType}>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTokenTypeColor(tokenType)}`}>
                                {tokenType} ({tokens.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {tokens.slice(0, 8).map((token) => (
                                <span
                                  key={token}
                                  className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700"
                                >
                                  {token}
                                </span>
                              ))}
                              {tokens.length > 8 && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                                  +{tokens.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {currentPatterns.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all {currentPatterns.length} {activeTab} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternUsageTracker;
