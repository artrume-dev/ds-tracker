import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export interface NotificationData {
  id: string;
  type: 'token_change' | 'pattern_update' | 'scan_complete' | 'approval_required' | 'system_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  metadata?: {
    tokenName?: string;
    teamName?: string;
    oldValue?: string;
    newValue?: string;
    affectedFiles?: string[];
    scanId?: string;
    requestId?: string;
  };
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  isConnected: boolean;
  subscribeToTeam: (teamName: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  currentTeam: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to notification service');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from notification service');
      setIsConnected(false);
    });

    newSocket.on('new_notification', (data: { teamName: string; notification: NotificationData }) => {
      if (data.teamName === currentTeam) {
        setNotifications(prev => [data.notification, ...prev.slice(0, 49)]); // Keep last 50
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(data.notification.title, {
            body: data.notification.message,
            icon: '/favicon.ico'
          });
        }
      }
    });

    newSocket.on('unread_count', (data: { teamName: string; count: number }) => {
      if (data.teamName === currentTeam) {
        setUnreadCount(data.count);
      }
    });

    newSocket.on('notifications_history', (data: { teamName: string; notifications: NotificationData[] }) => {
      if (data.teamName === currentTeam) {
        setNotifications(data.notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }
    });

    newSocket.on('team_notifications', (data: { teamName: string; notifications: NotificationData[] }) => {
      if (data.teamName === currentTeam) {
        setNotifications(data.notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }
    });

    newSocket.on('system_announcement', (data: { title: string; message: string; severity: string; timestamp: Date }) => {
      // Handle system announcements
      const systemNotification: NotificationData = {
        id: `system-${Date.now()}`,
        type: 'system_alert',
        title: data.title,
        message: data.message,
        severity: data.severity as NotificationData['severity'],
        timestamp: new Date(data.timestamp),
        read: false
      };
      
      setNotifications(prev => [systemNotification, ...prev.slice(0, 49)]);
    });

    setSocket(newSocket);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, [currentTeam]);

  const subscribeToTeam = (teamName: string) => {
    if (socket && teamName !== currentTeam) {
      // Unsubscribe from previous team
      if (currentTeam) {
        socket.emit('unsubscribe_team', currentTeam);
      }
      
      // Subscribe to new team
      socket.emit('subscribe_team', teamName);
      setCurrentTeam(teamName);
      
      // Reset notifications for new team
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = (notificationId: string) => {
    if (socket && currentTeam) {
      socket.emit('mark_notification_read', {
        teamName: currentTeam,
        notificationId
      });

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    }
  };

  const markAllAsRead = () => {
    if (socket && currentTeam) {
      socket.emit('mark_all_read', currentTeam);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    subscribeToTeam,
    markAsRead,
    markAllAsRead,
    currentTeam
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
