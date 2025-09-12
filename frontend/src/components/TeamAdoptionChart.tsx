import React from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamAdoptionData {
  name: string;
  adoption: number;
  trend: 'up' | 'down' | 'stable';
}

interface TeamAdoptionChartProps {
  teamData?: TeamAdoptionData[];
}

const TeamAdoptionChart: React.FC<TeamAdoptionChartProps> = ({ teamData = [] }) => {
  // Mock data if no data provided
  const mockData: TeamAdoptionData[] = [
    { name: 'Frontend', adoption: 95, trend: 'up' },
    { name: 'Mobile', adoption: 87, trend: 'up' },
    { name: 'Platform', adoption: 78, trend: 'stable' },
    { name: 'Marketing', adoption: 45, trend: 'down' },
    { name: 'Analytics', adoption: 62, trend: 'up' },
  ];

  const displayData = teamData.length > 0 ? teamData : mockData;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {displayData.map((team, index) => (
        <Link 
          key={team.name} 
          to={`/team/${encodeURIComponent(team.name)}`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              {team.name[0]}
            </div>
            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{team.name}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {getTrendIcon(team.trend)}
              <span className={`text-sm font-medium ${getTrendColor(team.trend)}`}>
                {team.adoption}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300 group-hover:bg-blue-600"
                style={{ width: `${team.adoption}%` }}
              ></div>
            </div>
            
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>
      ))}
      
      {displayData.length === 0 && (
        <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400 mb-2">👥</div>
            <p className="text-gray-600">No team data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamAdoptionChart;
