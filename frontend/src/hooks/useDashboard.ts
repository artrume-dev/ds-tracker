import { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';

export interface DashboardMetrics {
  totalTokens: number;
  activeUsages: number;
  teamsCount: number;
  criticalIssues: number;
  growthPercentage: number;
  usageGrowth: number;
  teamGrowth: number;
  issueReduction: number;
}

export interface TeamAdoptionData {
  name: string;
  adoption: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ActivityItem {
  id: string;
  type: 'scan' | 'token_update' | 'team_join' | 'issue';
  description: string;
  timestamp: string;
  user?: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface TopToken {
  name: string;
  usage: number;
  category: string;
  subcategory?: string;
  purpose?: string;
  type?: 'raw' | 'foundation' | 'component';
  trend?: 'up' | 'down';
  change?: string;
}

// Move mock data outside the component to prevent recreation on every render
const mockMetrics: DashboardMetrics = {
  totalTokens: 247,
  activeUsages: 1834,
  teamsCount: 12,
  criticalIssues: 3,
  growthPercentage: 12.5,
  usageGrowth: 8.2,
  teamGrowth: 25.0,
  issueReduction: -15.3,
};

const mockTeamData: TeamAdoptionData[] = [
  { name: 'Frontend', adoption: 95, trend: 'up' },
  { name: 'Mobile', adoption: 87, trend: 'up' },
  { name: 'Platform', adoption: 78, trend: 'stable' },
  { name: 'Marketing', adoption: 45, trend: 'down' },
  { name: 'Analytics', adoption: 62, trend: 'up' },
];

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'scan',
    description: 'Full system scan completed - 12 new token usages found',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'System',
    severity: 'info',
  },
  {
    id: '2',
    type: 'token_update',
    description: 'Token color-primary updated from #1f2937 to #1e40af',
    timestamp: '2024-01-15T09:15:00Z',
    user: 'Sarah Chen',
    severity: 'warning',
  },
  {
    id: '3',
    type: 'team_join',
    description: 'Analytics team joined the design system',
    timestamp: '2024-01-15T08:45:00Z',
    user: 'Mike Johnson',
    severity: 'info',
  },
  {
    id: '4',
    type: 'issue',
    description: 'Deprecated token found in Mobile app - spacing-xl',
    timestamp: '2024-01-15T08:20:00Z',
    user: 'Scanner',
    severity: 'error',
  },
  {
    id: '5',
    type: 'scan',
    description: 'Mobile team scan completed - no issues found',
    timestamp: '2024-01-15T07:30:00Z',
    user: 'System',
    severity: 'info',
  },
];

const mockTopTokens: TopToken[] = [
  { name: 'color-primary-500', usage: 156, category: 'color', trend: 'up', change: '+12%' },
  { name: 'spacing-md', usage: 143, category: 'spacing', trend: 'up', change: '+8%' },
  { name: 'font-size-lg', usage: 132, category: 'typography', trend: 'up', change: '+15%' },
  { name: 'border-radius-md', usage: 98, category: 'border', trend: 'up', change: '+5%' },
  { name: 'shadow-lg', usage: 87, category: 'shadow', trend: 'down', change: '-2%' }
];

export const useDashboard = () => {
  // Helper functions to transform API data
  const transformActivityType = (apiType: string): 'scan' | 'token_update' | 'team_join' | 'issue' => {
    switch (apiType) {
      case 'scan-completed':
        return 'scan';
      case 'token-updated':
      case 'token-deprecated':
        return 'token_update';
      case 'team-added':
        return 'team_join';
      case 'approval-requested':
        return 'issue';
      default:
        return 'scan';
    }
  };

  const getSeverityFromType = (apiType: string): 'info' | 'warning' | 'error' => {
    switch (apiType) {
      case 'token-deprecated':
      case 'approval-requested':
        return 'warning';
      case 'scan-failed':
        return 'error';
      default:
        return 'info';
    }
  };

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTokens: 0,
    activeUsages: 0,
    teamsCount: 0,
    criticalIssues: 0,
    growthPercentage: 0,
    usageGrowth: 0,
    teamGrowth: 0,
    issueReduction: 0,
  });
  
  const [teamData, setTeamData] = useState<TeamAdoptionData[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [topTokens, setTopTokens] = useState<TopToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data from API
      try {
        // Use the full dashboard endpoint instead of separate endpoints
        const dashboardResponse = await dashboardAPI.getDashboardData();
        const dashboardData = dashboardResponse.data.data;

        // Set metrics from dashboard data
        setMetrics({
          totalTokens: dashboardData.metrics.totalTokens || 0,
          activeUsages: dashboardData.metrics.totalUsage || 0,
          teamsCount: dashboardData.metrics.teamsUsing || 0,
          criticalIssues: dashboardData.metrics.criticalIssues || 0,
          growthPercentage: dashboardData.metrics.weeklyGrowth || 0,
          usageGrowth: dashboardData.metrics.weeklyGrowth || 0,
          teamGrowth: 0, // Calculate from team data if needed
          issueReduction: 0, // Calculate from historical data if needed
        });

        // Transform team adoption data
        const transformedTeamData = dashboardData.teamAdoption?.map((team: any) => ({
          name: team.teamName,
          adoption: team.adoptionScore,
          trend: team.trend || 'stable'
        })) || [];
        setTeamData(transformedTeamData);
        
        // Transform API activity data to match frontend interface
        const apiActivityData = Array.isArray(dashboardData.recentActivity) ? dashboardData.recentActivity : [];
        const transformedActivity = apiActivityData.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          type: transformActivityType(item.type),
          description: item.message || item.description || 'Activity recorded',
          timestamp: item.timestamp,
          user: item.user || 'System',
          severity: getSeverityFromType(item.type)
        }));
        setActivity(transformedActivity);

        // Set top tokens data from the real API response
        const apiTopTokens = Array.isArray(dashboardData.topTokens) ? dashboardData.topTokens : [];
        const transformedTopTokens = apiTopTokens.map((token: any) => ({
          name: token.name,
          usage: token.usage,
          category: token.category,
          trend: token.trend || 'stable',
          change: token.change || '0%'
        }));
        setTopTokens(transformedTopTokens);

      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        
        // Use mock data when API is not available
        setMetrics(mockMetrics);
        setTeamData(mockTeamData);
        setActivity(mockActivity);
        setTopTokens(mockTopTokens);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      
      // Fallback to mock data on error
      setMetrics(mockMetrics);
      setTeamData(mockTeamData);
      setActivity(mockActivity);
      setTopTokens(mockTopTokens);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies since mock data is now stable

  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    // Data
    metrics,
    teamData,
    activity,
    topTokens,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
  };
};
