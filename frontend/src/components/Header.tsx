import React from 'react';
import { Search, User, Play, RefreshCw, Settings } from 'lucide-react';
import { useScanner } from '../hooks/useScanner';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

interface HeaderProps {
  onScanTrigger?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onScanTrigger }) => {
  const { 
    isScanning, 
    scanProgress, 
    scanStatus, 
    error, 
    runFullScan, 
    clearError 
  } = useScanner();
  
  const { subscribeToTeam } = useNotifications();

  // Subscribe to Design System team notifications for now
  React.useEffect(() => {
    subscribeToTeam('Design System');
  }, [subscribeToTeam]);

  const triggerScan = async () => {
    try {
      await runFullScan();
      if (onScanTrigger) {
        onScanTrigger();
      }
    } catch (err) {
      console.error('Scan failed:', err);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tokens, teams, or applications..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Scan Button */}
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isScanning
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Scan
                </>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <NotificationPanel />

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-3 p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Sarah Chen</p>
                  <p className="text-xs text-gray-500">Design System Lead</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Scan Status Bar */}
      {(isScanning || scanStatus) && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {scanStatus || 'Scanning repositories for token usage...'}
                </p>
                <p className="text-xs text-blue-700">This may take a few minutes depending on repository size</p>
              </div>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {scanProgress}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Bar */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 text-red-600">⚠️</div>
              <div>
                <p className="text-sm font-medium text-red-900">Scan failed</p>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
