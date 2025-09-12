import { Server, Socket } from 'socket.io';

// Define event types locally for now
interface TokenChangeEvent {
  type: 'TOKEN_CHANGE';
  payload: {
    tokenId: string;
    changeType: 'created' | 'updated' | 'deprecated' | 'deleted';
    changes: any;
  };
  timestamp: Date;
}

interface UsageUpdateEvent {
  type: 'USAGE_UPDATE';
  payload: {
    tokenId: string;
    usageChange: number;
    source: string;
  };
  timestamp: Date;
}

interface ApprovalStatusEvent {
  type: 'APPROVAL_STATUS';
  payload: {
    changeRequestId: string;
    newStatus: string;
    reviewer?: any;
  };
  timestamp: Date;
}

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔗 Client connected: ${socket.id}`);

    // Join user to their team room for targeted notifications
    socket.on('join-team', (teamId: string) => {
      socket.join(`team:${teamId}`);
      console.log(`👥 Client ${socket.id} joined team: ${teamId}`);
    });

    // Join user to specific token rooms for updates
    socket.on('subscribe-token', (tokenId: string) => {
      socket.join(`token:${tokenId}`);
      console.log(`🎯 Client ${socket.id} subscribed to token: ${tokenId}`);
    });

    // Unsubscribe from token updates
    socket.on('unsubscribe-token', (tokenId: string) => {
      socket.leave(`token:${tokenId}`);
      console.log(`🎯 Client ${socket.id} unsubscribed from token: ${tokenId}`);
    });

    // Handle approval actions
    socket.on('approval-action', (data: { changeRequestId: string; action: 'approve' | 'reject' }) => {
      // Broadcast to team members
      socket.broadcast.emit('approval-update', data);
    });

    socket.on('disconnect', () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
    });
  });

  return {
    // Broadcast token changes to subscribers
    broadcastTokenChange: (event: TokenChangeEvent) => {
      io.to(`token:${event.payload.tokenId}`).emit('token-change', event);
    },

    // Broadcast usage updates
    broadcastUsageUpdate: (event: UsageUpdateEvent) => {
      io.to(`token:${event.payload.tokenId}`).emit('usage-update', event);
    },

    // Broadcast approval status changes to team
    broadcastApprovalStatus: (event: ApprovalStatusEvent, teamId: string) => {
      io.to(`team:${teamId}`).emit('approval-status', event);
    },

    // Send notification to specific user
    sendNotification: (userId: string, notification: any) => {
      io.emit('notification', { userId, ...notification });
    },

    // Broadcast system-wide alerts
    broadcastAlert: (alert: any) => {
      io.emit('system-alert', alert);
    }
  };
}
