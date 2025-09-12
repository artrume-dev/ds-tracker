import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TokenTrendData {
  date: string;
  totalUsage: number;
  foundationTokens: number;
  componentTokens: number;
  rawTokens: number;
}

const TokenUsageChart: React.FC = () => {
  const [data, setData] = useState<TokenTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/trends');
        if (!response.ok) {
          throw new Error('Failed to fetch trend data');
        }
        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Generate mock data for demonstration
        const mockData = generateMockTrendData();
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
  }, []);

  const generateMockTrendData = (): TokenTrendData[] => {
    const data: TokenTrendData[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const baseUsage = 150 + i * 5; // Growing trend
      const variation = Math.random() * 20 - 10; // Random variation
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalUsage: Math.max(0, Math.round(baseUsage + variation)),
        foundationTokens: Math.max(0, Math.round((baseUsage + variation) * 0.6)),
        componentTokens: Math.max(0, Math.round((baseUsage + variation) * 0.25)),
        rawTokens: Math.max(0, Math.round((baseUsage + variation) * 0.15))
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl text-red-400 mb-2">⚠️</div>
          <p className="text-red-600">Failed to load chart data</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="totalUsage" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Total Usage"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="foundationTokens" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Foundation"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="componentTokens" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Component"
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="rawTokens" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Raw"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TokenUsageChart;
