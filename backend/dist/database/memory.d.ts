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
declare const memoryStore: {
    teamSubscriptions: Map<string, TeamSubscription>;
    emailConfig: EmailConfig | null;
    notifications: Map<string, Notification>;
    scanResults: Map<string, any>;
    gitCommits: Map<string, any>;
};
export declare function getTeamSubscriptions(): TeamSubscription[];
export declare function getTeamSubscription(teamName: string): TeamSubscription | null;
export declare function upsertTeamSubscription(teamName: string, email: string, tokenChanges: number, patternUpdates: number, scanResults: number, approvalRequests: number): void;
export declare function deleteTeamSubscription(teamName: string): void;
export declare function getEmailConfig(): EmailConfig | null;
export declare function upsertEmailConfig(provider: string, host: string | null, port: number | null, secure: number, authUser: string | null, authPass: string | null, fromEmail: string | null): void;
export declare function getNotificationsForTeam(teamName: string): Notification[];
export declare function saveNotification(notification: Notification): void;
export declare function markNotificationAsRead(notificationId: string): void;
export declare function saveScanResult(scanId: string, result: any): void;
export declare function getScanResult(scanId: string): any;
export declare function getAllScanResults(): any[];
export declare function saveGitCommit(commitHash: string, data: any): void;
export declare function getGitCommit(commitHash: string): any;
export default memoryStore;
//# sourceMappingURL=memory.d.ts.map