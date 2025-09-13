"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsService = exports.WebSocketService = void 0;
const socket_io_1 = require("socket.io");
const NotificationService_1 = require("../services/NotificationService");
class WebSocketService {
    constructor(server) {
        this.teamConnections = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3001",
                methods: ["GET", "POST"]
            }
        });
        this.setupEventHandlers();
        this.setupNotificationListener();
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);
            // Handle team subscription
            socket.on('subscribe_team', (teamName) => {
                if (!teamName)
                    return;
                console.log(`👥 ${socket.id} subscribed to team: ${teamName}`);
                // Join room for this team
                socket.join(`team:${teamName}`);
                // Track connection
                if (!this.teamConnections.has(teamName)) {
                    this.teamConnections.set(teamName, new Set());
                }
                this.teamConnections.get(teamName).add(socket.id);
                // Send recent notifications for this team
                const recentNotifications = NotificationService_1.notificationService.getTeamNotifications(teamName, 10);
                socket.emit('notifications_history', {
                    teamName,
                    notifications: recentNotifications
                });
                // Send unread count
                const unreadCount = NotificationService_1.notificationService.getUnreadCount(teamName);
                socket.emit('unread_count', { teamName, count: unreadCount });
            });
            // Handle unsubscribe from team
            socket.on('unsubscribe_team', (teamName) => {
                if (!teamName)
                    return;
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
            socket.on('mark_notification_read', (data) => {
                const success = NotificationService_1.notificationService.markAsRead(data.teamName, data.notificationId);
                if (success) {
                    const unreadCount = NotificationService_1.notificationService.getUnreadCount(data.teamName);
                    // Update unread count for all team members
                    this.io.to(`team:${data.teamName}`).emit('unread_count', {
                        teamName: data.teamName,
                        count: unreadCount
                    });
                }
            });
            // Handle mark all notifications as read
            socket.on('mark_all_read', (teamName) => {
                const markedCount = NotificationService_1.notificationService.markAllAsRead(teamName);
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
            socket.on('get_team_notifications', (data) => {
                const notifications = NotificationService_1.notificationService.getTeamNotifications(data.teamName, data.limit);
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
    setupNotificationListener() {
        // Listen for new notifications from the notification service
        NotificationService_1.notificationService.on('notification', (data) => {
            const { teamName, notification } = data;
            // Send notification to all team members
            this.io.to(`team:${teamName}`).emit('new_notification', {
                teamName,
                notification
            });
            // Update unread count
            const unreadCount = NotificationService_1.notificationService.getUnreadCount(teamName);
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
    sendToTeam(teamName, event, data) {
        this.io.to(`team:${teamName}`).emit(event, data);
    }
    /**
     * Send notification to all connected clients
     */
    broadcast(event, data) {
        this.io.emit(event, data);
    }
    /**
     * Get connected teams info
     */
    getConnectionInfo() {
        const info = {};
        this.teamConnections.forEach((connections, teamName) => {
            info[teamName] = connections.size;
        });
        return info;
    }
    /**
     * Send system-wide announcement
     */
    sendSystemAnnouncement(title, message, severity = 'info') {
        this.broadcast('system_announcement', {
            title,
            message,
            severity,
            timestamp: new Date()
        });
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=WebSocketService.js.map