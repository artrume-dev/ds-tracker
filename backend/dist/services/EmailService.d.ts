import { TokenChange } from './NotificationService';
export interface EmailConfig {
    provider: 'gmail' | 'smtp' | 'mock';
    auth: {
        user: string;
        pass: string;
    };
    smtp?: {
        host: string;
        port: number;
        secure: boolean;
    };
    from: string;
}
export interface NotificationData {
    id: string;
    type: 'token_change' | 'pattern_update' | 'scan_complete' | 'approval_required' | 'system_alert' | 'design_system_update' | 'contribution_review';
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
        commitHash?: string;
        author?: string;
        message?: string;
        commitMessage?: string;
        timestamp?: Date;
        gitChanges?: any[];
        totalChanges?: number;
        addedCount?: number;
        updatedCount?: number;
        removedCount?: number;
        highImpactCount?: number;
    };
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}
declare class EmailService {
    private transporter;
    private config;
    private isInitialized;
    initialize(config?: EmailConfig): Promise<void>;
    private getConfigFromEnv;
    sendNotification(notification: NotificationData, email: string, teamName: string): Promise<boolean>;
    sendNotificationEmail(): Promise<boolean>;
    sendTestEmail(to: string): Promise<boolean>;
    testConnection(): Promise<boolean>;
    getStatus(): {
        status: string;
        provider: string;
        lastCheck: string;
        hasTransporter: boolean;
    };
    private buildNotificationEmail;
    private getSeverityColor;
}
export declare const emailService: EmailService;
export {};
//# sourceMappingURL=EmailService.d.ts.map