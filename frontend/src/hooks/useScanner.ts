import { useState, useCallback } from 'react';
import { scannerAPI } from '../services/api';

export interface ScanResult {
  id: string;
  type: 'full' | 'team' | 'repository';
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  results?: {
    tokensFound: number;
    filesScanned: number;
    repositoriesScanned: number;
    errors: string[];
  };
}

export interface ScanStatistics {
  totalTokens: number;
  totalUsages: number;
  uniqueTokens: number;
  teamsCount: number;
  repositoriesCount: number;
  lastScanTime?: string;
}

export const useScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const runFullScan = useCallback(async () => {
    try {
      setIsScanning(true);
      setError(null);
      setScanStatus('Initializing full scan...');
      setScanProgress(10);

      // Start progress simulation immediately
      setScanStatus('Connecting to scanner service...');
      setScanProgress(20);

      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UI feedback

      setScanStatus('Scanning Canon Design System repositories...');
      setScanProgress(40);

      // Call the real API with proper error handling
      const response = await scannerAPI.runFullScan();
      
      setScanProgress(70);
      setScanStatus('Analyzing token patterns and dependencies...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setScanProgress(90);
      setScanStatus('Finalizing scan results...');
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // API call successful, complete the progress
      setScanProgress(100);
      const totalTokens = response.data.summary?.totalTokens || 0;
      const totalRepos = response.data.summary?.totalRepositories || 0;
      const uniqueTokens = response.data.summary?.uniqueTokens || 0;
      setScanStatus(`✅ Scan completed successfully! Found ${totalTokens} tokens (${uniqueTokens} unique) across ${totalRepos} repository.`);
      setIsScanning(false);
      
      // Reset after a longer delay to show success message
      setTimeout(() => {
        setScanProgress(0);
        setScanStatus('');
      }, 10000);

      return response.data;
    } catch (err: any) {
      console.error('Scan API error:', err);
      
      // More specific error handling
      let errorMessage = '❌ Scan failed: ';
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage += 'Unable to connect to scanner service. Please check if the backend is running on http://localhost:5001';
      } else if (err.response?.status === 404) {
        errorMessage += 'Scan endpoint not found. Please check the API configuration.';
      } else if (err.response?.status >= 500) {
        errorMessage += 'Internal server error. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else {
        errorMessage += err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
      
      // Clear error after a longer delay for user to read
      setTimeout(() => {
        setError(null);
      }, 10000);
      
      throw err;
    }
  }, []);

  const runTeamScan = useCallback(async (team: string) => {
    try {
      setIsScanning(true);
      setError(null);
      setScanStatus(`Scanning ${team} repositories...`);
      setScanProgress(20);

      const response = await scannerAPI.runTeamScan(team);
      
      // Simulate progress
      setTimeout(() => {
        setScanProgress(100);
        setScanStatus(`${team} scan completed`);
        setIsScanning(false);
        
        setTimeout(() => {
          setScanProgress(0);
          setScanStatus('');
        }, 2000);
      }, 3000);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run team scan');
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
      throw err;
    }
  }, []);

  const runRepositoryScan = useCallback(async (repository: string, team: string) => {
    try {
      setIsScanning(true);
      setError(null);
      setScanStatus(`Scanning ${repository}...`);
      setScanProgress(30);

      const response = await scannerAPI.runRepositoryScan(repository, team);
      
      setTimeout(() => {
        setScanProgress(100);
        setScanStatus(`${repository} scan completed`);
        setIsScanning(false);
        
        setTimeout(() => {
          setScanProgress(0);
          setScanStatus('');
        }, 2000);
      }, 2000);

      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run repository scan');
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
      throw err;
    }
  }, []);

  const getScanHistory = useCallback(async (limit?: number) => {
    try {
      const response = await scannerAPI.getScanHistory(limit);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch scan history');
      throw err;
    }
  }, []);

  const getLatestScan = useCallback(async () => {
    try {
      const response = await scannerAPI.getLatestScan();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch latest scan');
      throw err;
    }
  }, []);

  const getScanStatistics = useCallback(async (): Promise<ScanStatistics> => {
    try {
      const response = await scannerAPI.getScanStatistics();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch scan statistics');
      // Return mock data if API fails
      return {
        totalTokens: 0,
        totalUsages: 0,
        uniqueTokens: 0,
        teamsCount: 0,
        repositoriesCount: 0,
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isScanning,
    scanProgress,
    scanStatus,
    error,

    // Actions
    runFullScan,
    runTeamScan,
    runRepositoryScan,
    getScanHistory,
    getLatestScan,
    getScanStatistics,
    clearError,
  };
};
