import React from 'react';
import { BarChart3, Users, Activity, TrendingUp, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricsCard from './MetricsCard';
import TokenUsageChart from './TokenUsageChart';
import TeamAdoptionChart from './TeamAdoptionChart';
import RecentActivity from './RecentActivity';
import TokenCategories from './TokenCategories';
import PatternUsageTracker from './PatternUsageTracker';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { metrics, teamData, activity, topTokens, loading, error, refreshData } = useDashboard();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refreshData}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Design System Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor token usage across teams and applications</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Refresh Data
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricsCard
          title="Total Tokens"
          value={metrics.totalTokens}
          icon={<BarChart3 className="w-6 h-6" />}
          trend={{ value: metrics.growthPercentage, isPositive: metrics.growthPercentage > 0 }}
          className="col-span-1"
        />
        <MetricsCard
          title="Active Usages"
          value={metrics.activeUsages}
          icon={<Activity className="w-6 h-6" />}
          trend={{ value: metrics.usageGrowth, isPositive: metrics.usageGrowth > 0 }}
          className="col-span-1"
        />
        <MetricsCard
          title="Critical Issues"
          value={metrics.criticalIssues}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={{ value: metrics.issueReduction, isPositive: metrics.issueReduction < 0 }}
          className="col-span-1"
          variant={metrics.criticalIssues > 0 ? "danger" : "default"}
        />
        <MetricsCard
          title="Total Usage"
          value={`${(metrics.activeUsages / 1000).toFixed(1)}k`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: metrics.usageGrowth, isPositive: metrics.usageGrowth > 0 }}
          className="col-span-1"
        />
        <MetricsCard
          title="Teams Using"
          value={metrics.teamsCount}
          icon={<Users className="w-6 h-6" />}
          trend={{ value: metrics.teamGrowth, isPositive: metrics.teamGrowth > 0 }}
          className="col-span-1"
        />
        <MetricsCard
          title="System Health"
          value={metrics.criticalIssues === 0 ? "Good" : "Issues"}
          icon={<AlertTriangle className="w-6 h-6" />}
          className="col-span-1"
          variant={metrics.criticalIssues === 0 ? "default" : "warning"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage Trends</h3>
          <TokenUsageChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Team Adoption</h3>
            <Link 
              to="/teams" 
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              View All <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <TeamAdoptionChart teamData={teamData} />
        </div>
      </div>

      {/* Activity and Top Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <RecentActivity activities={activity} loading={loading} />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Used Tokens</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading tokens...</p>
              </div>
            ) : topTokens && topTokens.length > 0 ? (
              topTokens.slice(0, 5).map((token, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{token.name}</div>
                    <div className="text-xs text-gray-500 mb-1">
                      {token.category && `${token.category}${token.subcategory ? ` / ${token.subcategory}` : ''}`}
                    </div>
                    <div className="text-sm text-gray-600">{token.usage} usages</div>
                  </div>
                  <div className="text-right">
                    {token.type && (
                      <div className={`text-xs px-2 py-1 rounded-full mb-1 ${
                        token.type === 'raw' ? 'bg-red-100 text-red-700' :
                        token.type === 'foundation' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {token.type}
                      </div>
                    )}
                    <div className={`text-sm font-medium ${
                      token.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {token.change}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No token data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token Categories */}
      <TokenCategories />

      {/* Pattern Usage */}
      <PatternUsageTracker />
    </div>
  );
};

export default Dashboard;
