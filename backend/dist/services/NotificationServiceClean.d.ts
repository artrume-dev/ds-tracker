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
    /**
     * Initialize default team subscriptions
     */
    private initializeTeamSubscriptions;
    /**
     * Create and send a notification
     */
    createNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string>;
    /**
     * Get notifications for a specific team
     */
    getTeamNotifications(teamName: string, limit?: number): NotificationData[];
    /**
     * Mark notification as read
     */
    markAsRead(teamName: string, notificationId: string): boolean;
    /**
     * Mark all notifications as read for a team
     */
    markAllAsRead(teamName: string): number;
    /**
     * Get unread notification count for a team
     */
    getUnreadCount(teamName: string): number;
    /**
     * Update team subscription preferences
     */
    updateTeamSubscription(teamName: string, subscription: Partial<TeamSubscription>): Promise<void>;
    /**
     * Get team subscription settings
     */
    getTeamSubscription(teamName: string): Promise<TeamSubscription | null>;
    /**
     * Get all team subscriptions
     */
    getAllSubscriptions(): Promise<TeamSubscription[]>;
    /**
     * Remove team subscription
     */
    removeTeamSubscription(teamName: string): Promise<boolean>;
    /**
     * Determine which teams should receive this notification
     */
    private getTargetTeams;
    /**
     * Send external notifications (email, Slack, etc.)
     */
    private sendExternalNotifications;
    /**
     * Check if notification should be sent based on preferences
     */
    private shouldSendNotification;
    /**
     * Create notifications for token changes
     */
    notifyTokenChange(tokenName: string, oldValue: string, newValue: string, affectedTeams: string[], affectedFiles: string[]): Promise<void>;
    /**
     * Create notifications for scan completion
     */
    notifyScanComplete(scanId: string, results: {
        tokensFound: number;
        newTokens: number;
        issues: number;
        tokenChanges?: TokenChange[];
        repositoryName?: string;
    }): Promise<void>;
    /**
     * Notify all subscribed teams about Design System changes
     */
    notifyDesignSystemChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void>;
    /**
     * Create notifications for approval requests
     */
    notifyApprovalRequired(requestId: string, teamName: string, tokenName: string): Promise<void>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=NotificationServiceClean.d.ts.map