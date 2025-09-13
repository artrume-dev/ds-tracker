"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
function setupWebSocket(io) {
    io.on('connection', (socket) => {
        console.log(`🔗 Client connected: ${socket.id}`);
        // Join user to their team room for targeted notifications
        socket.on('join-team', (teamId) => {
            socket.join(`team:${teamId}`);
            console.log(`👥 Client ${socket.id} joined team: ${teamId}`);
        });
        // Join user to specific token rooms for updates
        socket.on('subscribe-token', (tokenId) => {
            socket.join(`token:${tokenId}`);
            console.log(`🎯 Client ${socket.id} subscribed to token: ${tokenId}`);
        });
        // Unsubscribe from token updates
        socket.on('unsubscribe-token', (tokenId) => {
            socket.leave(`token:${tokenId}`);
            console.log(`🎯 Client ${socket.id} unsubscribed from token: ${tokenId}`);
        });
        // Handle approval actions
        socket.on('approval-action', (data) => {
            // Broadcast to team members
            socket.broadcast.emit('approval-update', data);
        });
        socket.on('disconnect', () => {
            console.log(`👋 Client disconnected: ${socket.id}`);
        });
    });
    return {
        // Broadcast token changes to subscribers
        broadcastTokenChange: (event) => {
            io.to(`token:${event.payload.tokenId}`).emit('token-change', event);
        },
        // Broadcast usage updates
        broadcastUsageUpdate: (event) => {
            io.to(`token:${event.payload.tokenId}`).emit('usage-update', event);
        },
        // Broadcast approval status changes to team
        broadcastApprovalStatus: (event, teamId) => {
            io.to(`team:${teamId}`).emit('approval-status', event);
        },
        // Send notification to specific user
        sendNotification: (userId, notification) => {
            io.emit('notification', { userId, ...notification });
        },
        // Broadcast system-wide alerts
        broadcastAlert: (alert) => {
            io.emit('system-alert', alert);
        }
    };
}
//# sourceMappingURL=index.js.map