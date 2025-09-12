import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, FileText, Code, MapPin } from 'lucide-react';

interface TeamToken {
  tokenName: string;
  tokenType: string;
  totalCount: number;
  files: string[];
  category: string;
  subcategory?: string;
  purpose: string;
  type: 'raw' | 'foundation' | 'component';
}

interface TeamSummary {
  teamName: string;
  repository: string;
  totalTokens: number;
  totalUsage: number;
  raw: number;
  foundation: number;
  component: number;
  topTokens: TeamToken[];
  coveragePercentage: number;
}

interface TeamData {
  summary: TeamSummary;
  tokens: {
    raw: TeamToken[];
    foundation: TeamToken[];
    component: TeamToken[];
  };
  repository: {
    name: string;
    team: string;
    url: string;
    type: string;
  };
  patterns: Array<{
    name: string;
    usage: number;
    trend: number;
    complexity: string;
    instances: Array<{
      filePath: string;
      fileName: string;
      fileType: string;
      dependencies: string[];
    }>;
  }>;
}

const TeamPage: React.FC = () => {
  const { teamName } = useParams<{ teamName: string }>();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'raw' | 'foundation' | 'component'>('overview');
  const [expandedPatterns, setExpandedPatterns] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/team/${teamName}`);
        const result = await response.json();
        
        if (result.success) {
          setTeamData(result.data);
        } else {
          setError(result.error?.message || 'Failed to fetch team data');
        }
      } catch (err) {
        setError('Failed to connect to API');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamName) {
      fetchTeamData();
    }
  }, [teamName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error Loading Team Data</h2>
          <p className="text-red-600">{error || 'Team not found'}</p>
          <Link to="/" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { summary, tokens, repository, patterns } = teamData;

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'raw': return '🔸';
      case 'foundation': return '🏗️';
      case 'component': return '🧩';
      default: return '📦';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'complex': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const togglePatternExpansion = (patternName: string) => {
    const newExpanded = new Set(expandedPatterns);
    if (newExpanded.has(patternName)) {
      newExpanded.delete(patternName);
    } else {
      newExpanded.add(patternName);
    }
    setExpandedPatterns(newExpanded);
  };

  const getFileTypeIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'scss':
      case 'css':
        return '🎨';
      case 'ts':
      case 'tsx':
        return '📘';
      case 'js':
      case 'jsx':
        return '📙';
      case 'vue':
        return '💚';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  const renderTokenList = (tokenList: TeamToken[]) => (
    <div className="space-y-3">
      {tokenList.map((token, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-mono text-sm font-semibold text-gray-800">{token.tokenName}</h4>
              <p className="text-xs text-gray-500">{token.tokenType}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-600">{token.totalCount}</span>
              <p className="text-xs text-gray-500">uses</p>
            </div>
          </div>
          
          <div className="mb-2">
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {token.category}
            </span>
            {token.subcategory && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded ml-1">
                {token.subcategory}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{token.purpose}</p>
          
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              Used in {token.files.length} file(s)
            </summary>
            <ul className="mt-1 pl-4 space-y-1">
              {token.files.map((file, idx) => (
                <li key={idx} className="font-mono text-gray-600">{file}</li>
              ))}
            </ul>
          </details>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link to="/" className="text-blue-600 hover:underline">Dashboard</Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900 font-medium">Teams</li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900 font-medium">{teamName}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{summary.teamName} Team</h1>
            <p className="text-gray-600 mt-1">
              Repository: <span className="font-mono font-medium">{repository.name}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{summary.coveragePercentage}%</div>
            <div className="text-sm text-gray-500">Coverage</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalTokens}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalUsage}</p>
            </div>
            <div className="text-2xl">🔄</div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Raw Tokens</p>
              <p className="text-2xl font-bold text-orange-600">{summary.raw}</p>
            </div>
            <div className="text-2xl">🔸</div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Foundation</p>
              <p className="text-2xl font-bold text-blue-600">{summary.foundation}</p>
            </div>
            <div className="text-2xl">🏗️</div>
          </div>
        </div>
      </div>

      {/* Patterns Section */}
      {patterns.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Patterns</h2>
          <div className="space-y-4">
            {patterns.map((pattern, index) => {
              const isExpanded = expandedPatterns.has(pattern.name);
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => togglePatternExpansion(pattern.name)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{pattern.name}</h3>
                          <p className="text-sm text-gray-600">{pattern.usage} instances found</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(pattern.complexity)}`}>
                          {pattern.complexity}
                        </span>
                        {/* Count total dependencies across all instances */}
                        {pattern.instances.some(instance => instance.dependencies && instance.dependencies.length > 0) && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {pattern.instances.reduce((total, instance) => total + (instance.dependencies?.length || 0), 0)} dependencies
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-4">
                        {/* Token Dependencies - Aggregate from all instances */}
                        {pattern.instances.some(instance => instance.dependencies && instance.dependencies.length > 0) && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <Code className="w-4 h-4 mr-1" />
                              Token Dependencies
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(new Set(pattern.instances.flatMap(instance => instance.dependencies || []))).map((token, idx) => (
                                <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-mono">
                                  {token}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* File Locations */}
                        {pattern.instances && pattern.instances.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              Used in Files ({pattern.instances.length})
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {pattern.instances.map((instance, idx) => (
                                <div key={idx} className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200">
                                  <span className="text-lg">{getFileTypeIcon(instance.filePath)}</span>
                                  <span className="font-mono text-sm text-gray-700 flex-1">{instance.filePath}</span>
                                  {instance.dependencies && instance.dependencies.length > 0 && (
                                    <span className="px-1 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                      {instance.dependencies.length} deps
                                    </span>
                                  )}
                                  <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Fallback if no instances */}
                        {(!pattern.instances || pattern.instances.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">File locations not available</p>
                            <p className="text-xs">Pattern detected but location details need to be enhanced</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Top Tokens', count: summary.topTokens.length },
              { key: 'raw', label: 'Raw Tokens', count: summary.raw },
              { key: 'foundation', label: 'Foundation', count: summary.foundation },
              { key: 'component', label: 'Component', count: summary.component }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getCategoryIcon(tab.key)} {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Tokens</h3>
            {renderTokenList(summary.topTokens)}
          </div>
        )}

        {activeTab === 'raw' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Raw Tokens ({tokens.raw.length})
            </h3>
            <p className="text-gray-600 mb-4">
              Basic design values like colors, sizes, and raw spacing units.
            </p>
            {renderTokenList(tokens.raw)}
          </div>
        )}

        {activeTab === 'foundation' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Foundation Tokens ({tokens.foundation.length})
            </h3>
            <p className="text-gray-600 mb-4">
              Design system level tokens including CDS tokens, spacing scales, and theme mixins.
            </p>
            {renderTokenList(tokens.foundation)}
          </div>
        )}

        {activeTab === 'component' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Component Tokens ({tokens.component.length})
            </h3>
            <p className="text-gray-600 mb-4">
              Component-specific styling tokens for UI elements and patterns.
            </p>
            {renderTokenList(tokens.component)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
