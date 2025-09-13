export interface TeamSubscription {
    teamName: string;
    email: string;
    tokenChanges: boolean;
    patternUpdates: boolean;
    scanResults: boolean;
    approvalRequests: boolean;
}
export interface EmailConfig {
    provider: string;
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
        user: string;
        pass: string;
    };
    from?: string;
}
export interface Notification {
    id: string;
    teamName: string;
    type: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    metadata?: any;
    read: boolean;
    actionUrl?: string;
    createdAt: Date;
}
export declare class DatabaseService {
    private teamSubscriptions;
    private emailConfig;
    private notifications;
    private scanResults;
    private gitCommits;
    constructor();
    private initializeDefaultData;
    getTeamSubscriptions(): Promise<TeamSubscription[]>;
    getTeamSubscription(teamName: string): Promise<TeamSubscription | null>;
    saveTeamSubscription(subscription: TeamSubscription): Promise<void>;
    deleteTeamSubscription(teamName: string): Promise<void>;
    getEmailConfig(): Promise<EmailConfig | null>;
    saveEmailConfig(config: EmailConfig): Promise<void>;
    getNotificationsForTeam(teamName: string): Promise<Notification[]>;
    saveNotification(notification: Notification): Promise<void>;
    markNotificationAsRead(notificationId: string): Promise<void>;
    saveScanResult(scanId: string, result: any): Promise<void>;
    getScanResult(scanId: string): Promise<any>;
    getAllScanResults(): Promise<any[]>;
    getLastProcessedCommit(repository: string): Promise<string | null>;
    markCommitAsProcessed(repository: string, commitHash: string): Promise<void>;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=service.d.ts.map