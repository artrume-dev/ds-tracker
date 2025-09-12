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

export class NotificationServiceTest extends EventEmitter {
  async notifyDesignSystemChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void> {
    console.log('🔔 Test notification: Design system changes detected', { scanId, changeCount: tokenChanges.length });
  }

  async notifyScanComplete(scanId: string, data: any): Promise<void> {
    console.log('✅ Test notification: Scan completed', { scanId, data });
  }

  async notifyTokenChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void> {
    console.log('🪙 Test notification: Token changes', { scanId, changeCount: tokenChanges.length });
  }

  async sendExternalNotifications(notification: any): Promise<void> {
    console.log('📧 Test notification: External notification sent', notification);
  }

  async createNotification(data: any): Promise<any> {
    console.log('📝 Test notification: Created notification', data);
    return { id: 'test-notification-' + Date.now(), ...data };
  }
}

export const notificationServiceTest = new NotificationServiceTest();
