import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { notificationService, NotificationData } from '../services/NotificationService';

export class WebSocketService {
  private io: SocketIOServer;
  private teamConnections: Map<string, Set<string>> = new Map();

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
    this.setupNotificationListener();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle team subscription
      socket.on('subscribe_team', (teamName: string) => {
        if (!teamName) return;
        
        console.log(`👥 ${socket.id} subscribed to team: ${teamName}`);
        
        // Join room for this team
        socket.join(`team:${teamName}`);
        
        // Track connection
        if (!this.teamConnections.has(teamName)) {
          this.teamConnections.set(teamName, new Set());
        }
        this.teamConnections.get(teamName)!.add(socket.id);

        // Send recent notifications for this team
        const recentNotifications = notificationService.getTeamNotifications(teamName, 10);
        socket.emit('notifications_history', {
          teamName,
          notifications: recentNotifications
        });

        // Send unread count
        const unreadCount = notificationService.getUnreadCount(teamName);
        socket.emit('unread_count', { teamName, count: unreadCount });
      });

      // Handle unsubscribe from team
      socket.on('unsubscribe_team', (teamName: string) => {
        if (!teamName) return;
        
        console.log(`👥 ${socket.id} unsubscribed from team: ${teamName}`);
        socket.leave(`team:${teamName}`);
        
        const connections = this.teamConnections.get(teamName);
        if (connections) {
          connections.delete(socket.id);
          if (connections.size === 0) {
            this.teamConnections.delete(teamName);
          }
        }
      });

      // Handle mark notification as read
      socket.on('mark_notification_read', (data: { teamName: string; notificationId: string }) => {
        const success = notificationService.markAsRead(data.teamName, data.notificationId);
        if (success) {
          const unreadCount = notificationService.getUnreadCount(data.teamName);
          
          // Update unread count for all team members
          this.io.to(`team:${data.teamName}`).emit('unread_count', {
            teamName: data.teamName,
            count: unreadCount
          });
        }
      });

      // Handle mark all notifications as read
      socket.on('mark_all_read', (teamName: string) => {
        const markedCount = notificationService.markAllAsRead(teamName);
        if (markedCount > 0) {
          // Update unread count for all team members
          this.io.to(`team:${teamName}`).emit('unread_count', {
            teamName,
            count: 0
          });

          socket.emit('notifications_marked_read', {
            teamName,
            count: markedCount
          });
        }
      });

      // Handle get team notifications
      socket.on('get_team_notifications', (data: { teamName: string; limit?: number }) => {
        const notifications = notificationService.getTeamNotifications(data.teamName, data.limit);
        socket.emit('team_notifications', {
          teamName: data.teamName,
          notifications
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        
        // Remove from all team connections
        this.teamConnections.forEach((connections, teamName) => {
          if (connections.has(socket.id)) {
            connections.delete(socket.id);
            if (connections.size === 0) {
              this.teamConnections.delete(teamName);
            }
          }
        });
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  private setupNotificationListener() {
    // Listen for new notifications from the notification service
    notificationService.on('notification', (data: { teamName: string; notification: NotificationData }) => {
      const { teamName, notification } = data;
      
      // Send notification to all team members
      this.io.to(`team:${teamName}`).emit('new_notification', {
        teamName,
        notification
      });

      // Update unread count
      const unreadCount = notificationService.getUnreadCount(teamName);
      this.io.to(`team:${teamName}`).emit('unread_count', {
        teamName,
        count: unreadCount
      });

      console.log(`📱 Real-time notification sent to team ${teamName}: ${notification.title}`);
    });
  }

  /**
   * Send notification to specific team
   */
  public sendToTeam(teamName: string, event: string, data: any) {
    this.io.to(`team:${teamName}`).emit(event, data);
  }

  /**
   * Send notification to all connected clients
   */
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  /**
   * Get connected teams info
   */
  public getConnectionInfo() {
    const info: { [key: string]: number } = {};
    this.teamConnections.forEach((connections, teamName) => {
      info[teamName] = connections.size;
    });
    return info;
  }

  /**
   * Send system-wide announcement
   */
  public sendSystemAnnouncement(title: string, message: string, severity: 'info' | 'warning' | 'error' = 'info') {
    this.broadcast('system_announcement', {
      title,
      message,
      severity,
      timestamp: new Date()
    });
  }
}

export let wsService: WebSocketService;
