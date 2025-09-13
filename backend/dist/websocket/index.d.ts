import { Server } from 'socket.io';
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
export declare function setupWebSocket(io: Server): {
    broadcastTokenChange: (event: TokenChangeEvent) => void;
    broadcastUsageUpdate: (event: UsageUpdateEvent) => void;
    broadcastApprovalStatus: (event: ApprovalStatusEvent, teamId: string) => void;
    sendNotification: (userId: string, notification: any) => void;
    broadcastAlert: (alert: any) => void;
};
export {};
//# sourceMappingURL=index.d.ts.map