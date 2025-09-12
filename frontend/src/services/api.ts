import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for long-running scans
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens (when implemented)
api.interceptors.request.use((config) => {
  // Add auth token when available
  // const token = localStorage.getItem('auth_token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Scanner API
export const scannerAPI = {
  // Run scans (Note: These may require auth in production)
  runFullScan: () => api.post('/scans/run', { type: 'full' }, { timeout: 60000 }), // 60 seconds for full scan
  runTeamScan: (team: string) => api.post('/scans/run', { type: 'team', team }, { timeout: 45000 }),
  runRepositoryScan: (repository: string, team: string) => 
    api.post('/scans/run', { type: 'repository', repository, team }, { timeout: 30000 }),

  // Get scan data (public endpoints)
  getScanHistory: (limit?: number) => api.get('/scans', { params: { limit } }),
  getLatestScan: () => api.get('/scans/latest'),
  getScanStatistics: () => api.get('/scans/statistics'),
  
  // Token details
  getTokenDetails: (tokenName: string) => api.get(`/scans/token/${tokenName}`),
  
  // Schedule scans (may require auth)
  scheduleAutomatedScan: (frequency: string, teams?: string[]) =>
    api.post('/scans/schedule', { frequency, teams }),
};

// Dashboard API
export const dashboardAPI = {
  // Main dashboard data
  getDashboardData: () => api.get('/dashboard'),
  getMetrics: () => api.get('/dashboard/metrics'),
  getTeamData: () => api.get('/dashboard/teams'),
  getActivity: (limit?: number) => api.get('/dashboard/activity', { params: { limit } }),
  
  // New categorization and pattern endpoints
  getCategorizedTokens: () => api.get('/dashboard/tokens/categorized'),
  getPatterns: () => api.get('/dashboard/patterns'),
};

// Teams API
export const teamsAPI = {
  getTeams: () => api.get('/teams'),
  getTeam: (teamId: string) => api.get(`/teams/${teamId}`),
  createTeam: (teamData: any) => api.post('/teams', teamData),
  updateTeam: (teamId: string, teamData: any) => api.put(`/teams/${teamId}`, teamData),
  deleteTeam: (teamId: string) => api.delete(`/teams/${teamId}`),
};

// Tokens API
export const tokensAPI = {
  getTokens: (params?: any) => api.get('/tokens', { params }),
  getToken: (tokenId: string) => api.get(`/tokens/${tokenId}`),
  createToken: (tokenData: any) => api.post('/tokens', tokenData),
  updateToken: (tokenId: string, tokenData: any) => api.put(`/tokens/${tokenId}`, tokenData),
  deprecateToken: (tokenId: string) => api.post(`/tokens/${tokenId}/deprecate`),
};

// Change Requests API
export const changeRequestsAPI = {
  getChangeRequests: (params?: any) => api.get('/change-requests', { params }),
  getChangeRequest: (requestId: string) => api.get(`/change-requests/${requestId}`),
  createChangeRequest: (requestData: any) => api.post('/change-requests', requestData),
  approveChangeRequest: (requestId: string) => api.post(`/change-requests/${requestId}/approve`),
  rejectChangeRequest: (requestId: string, reason: string) => 
    api.post(`/change-requests/${requestId}/reject`, { reason }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
};

// Export the base API instance for custom requests
export default api;
