import { EventEmitter } from 'events';
import { TeamSubscription } from '../database/service';
export interface TokenChange {
    type: 'added' | 'updated' | 'removed';
    tokenName: string;
    category?: string;
    oldValue?: string;
    newValue?: string;
    affectedFiles?: string[];
    usageCount?: number;
    filePath?: string;
    description?: string;
}
export interface NotificationData {
    id: string;
    type: 'token_change' | 'pattern_update' | 'scan_complete' | 'approval_required' | 'system_alert' | 'design_system_update';
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
        tokenChanges?: TokenChange[];
        repositoryName?: string;
    };
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}
declare class NotificationService extends EventEmitter {
    private notifications;
    constructor();
    private initializeTeamSubscriptions;
    createNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string>;
    getTeamNotifications(teamName: string, limit?: number): NotificationData[];
    markAsRead(teamName: string, notificationId: string): boolean;
    markAllAsRead(teamName: string): number;
    getUnreadCount(teamName: string): number;
    updateTeamSubscription(teamName: string, subscription: Partial<TeamSubscription>): Promise<void>;
    getTeamSubscription(teamName: string): Promise<TeamSubscription | null>;
    getAllSubscriptions(): Promise<TeamSubscription[]>;
    removeTeamSubscription(teamName: string): Promise<boolean>;
    private getTargetTeams;
    private sendExternalNotifications;
    private shouldSendNotification;
    notifyTokenChange(tokenName: string, oldValue: string, newValue: string, affectedTeams: string[], affectedFiles: string[]): Promise<void>;
    notifyScanComplete(scanId: string, results: {
        tokensFound: number;
        newTokens: number;
        issues: number;
        tokenChanges?: TokenChange[];
        repositoryName?: string;
    }): Promise<void>;
    notifyDesignSystemChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void>;
    notifyApprovalRequired(requestId: string, teamName: string, tokenName: string): Promise<void>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=NotificationService.d.ts.map