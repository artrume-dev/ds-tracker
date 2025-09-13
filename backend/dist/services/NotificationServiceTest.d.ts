import { EventEmitter } from 'events';
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
export declare class NotificationServiceTest extends EventEmitter {
    notifyDesignSystemChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void>;
    notifyScanComplete(scanId: string, data: any): Promise<void>;
    notifyTokenChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void>;
    sendExternalNotifications(notification: any): Promise<void>;
    createNotification(data: any): Promise<any>;
}
export declare const notificationServiceTest: NotificationServiceTest;
//# sourceMappingURL=NotificationServiceTest.d.ts.map