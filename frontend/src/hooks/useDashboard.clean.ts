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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for development
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch real data from API
      try {
        const [metricsResponse, teamResponse, activityResponse] = await Promise.all([
          dashboardAPI.getMetrics(),
          dashboardAPI.getTeamData(),
          dashboardAPI.getActivity(5),
        ]);

        setMetrics(metricsResponse.data);
        setTeamData(teamResponse.data);
        
        // Transform API activity data to match frontend interface
        const apiActivityData = Array.isArray(activityResponse.data) ? activityResponse.data : [];
        const transformedActivity = apiActivityData.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          type: transformActivityType(item.type),
          description: item.message || item.description || 'Activity recorded',
          timestamp: item.timestamp,
          user: item.user || 'System',
          severity: getSeverityFromType(item.type)
        }));
        
        setActivity(transformedActivity);
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
        
        // Use mock data when API is not available
        setMetrics(mockMetrics);
        setTeamData(mockTeamData);
        setActivity(mockActivity);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      
      // Fallback to mock data on error
      setMetrics(mockMetrics);
      setTeamData(mockTeamData);
      setActivity(mockActivity);
    } finally {
      setLoading(false);
    }
  }, [mockActivity, mockMetrics, mockTeamData]);

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
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
  };
};
