import { Server } from 'http';
export declare class WebSocketService {
    private io;
    private teamConnections;
    constructor(server: Server);
    private setupEventHandlers;
    private setupNotificationListener;
    /**
     * Send notification to specific team
     */
    sendToTeam(teamName: string, event: string, data: any): void;
    /**
     * Send notification to all connected clients
     */
    broadcast(event: string, data: any): void;
    /**
     * Get connected teams info
     */
    getConnectionInfo(): {
        [key: string]: number;
    };
    /**
     * Send system-wide announcement
     */
    sendSystemAnnouncement(title: string, message: string, severity?: 'info' | 'warning' | 'error'): void;
}
export declare let wsService: WebSocketService;
//# sourceMappingURL=WebSocketService.d.ts.map