import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'scan' | 'token_update' | 'team_join' | 'issue';
  description: string;
  timestamp: string;
  user?: string;
  severity?: 'info' | 'warning' | 'error';
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  // Mock activity data as fallback
  const mockActivities = [
    {
      id: '1',
      type: 'token_update' as const,
      description: 'Updated color-primary-500 value',
      user: 'Sarah Chen',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'info' as const
    },
    {
      id: '2',
      type: 'scan' as const,
      description: 'Completed scan for Marketing Web App',
      user: 'System',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      severity: 'info' as const
    },
    {
      id: '3',
      type: 'issue' as const,
      description: 'Requested approval for spacing token changes',
      user: 'Mike Johnson',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      severity: 'warning' as const
    },
    {
      id: '4',
      type: 'token_update' as const,
      description: 'Deprecated old-color-red token',
      user: 'Design System Team',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      severity: 'warning' as const
    },
    {
      id: '5',
      type: 'team_join' as const,
      description: 'E-commerce team joined design system',
      user: 'Admin',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      severity: 'info' as const
    }
  ];

  const displayActivities = activities || mockActivities;

  const getActivityIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'scan':
        return '🔍';
      case 'token_update':
        return severity === 'warning' ? '⚠️' : '🎨';
      case 'team_join':
        return '👥';
      case 'issue':
        return '⚠️';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="text-2xl">{getActivityIcon(activity.type, activity.severity)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-500">by {activity.user || 'System'}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;
