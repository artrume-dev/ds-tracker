import { EventEmitter } from 'events';
import { emailService } from './EmailService';
import { databaseService, TeamSubscription } from '../database/service';

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

class NotificationService extends EventEmitter {
  private notifications: Map<string, NotificationData[]> = new Map();
  
  constructor() {
    super();
    this.initializeTeamSubscriptions();
  }

  private async initializeTeamSubscriptions(): Promise<void> {
    console.log('🏗️ Initializing team subscriptions...');
    
    try {
      const existingTeams = await databaseService.getTeamSubscriptions();
      if (existingTeams.length > 0) {
        console.log(`✅ Found ${existingTeams.length} existing team subscriptions`);
        return;
      }

      const defaultTeams = ['Marketing', 'Product', 'Engineering', 'Design System'];
      
      for (const team of defaultTeams) {
        const subscription: TeamSubscription = {
          teamName: team,
          email: 'samar@teamstack.co',
          tokenChanges: true,
          patternUpdates: true,
          scanResults: true,
          approvalRequests: true
        };
        
        await databaseService.saveTeamSubscription(subscription);
        console.log(`✅ Initialized subscription for team: ${team}`);
      }
      
      console.log(`🎯 Total teams initialized: ${defaultTeams.length}`);
    } catch (error) {
      console.error('❌ Error initializing team subscriptions:', error);
    }
  }

  async createNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string> {
    const notificationData: NotificationData = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    const targetTeams = await this.getTargetTeams(notificationData);
    
    targetTeams.forEach(teamName => {
      if (!this.notifications.has(teamName)) {
        this.notifications.set(teamName, []);
      }
      this.notifications.get(teamName)!.push(notificationData);
      
      const teamNotifications = this.notifications.get(teamName)!;
      if (teamNotifications.length > 100) {
        teamNotifications.splice(0, teamNotifications.length - 100);
      }
    });

    targetTeams.forEach(teamName => {
      this.emit('notification', {
        teamName,
        notification: notificationData
      });
    });

    await this.sendExternalNotifications(notificationData, targetTeams);

    console.log(`📢 Notification created: ${notificationData.title} (${targetTeams.join(', ')})`);
    return notificationData.id;
  }

  getTeamNotifications(teamName: string, limit: number = 50): NotificationData[] {
    const notifications = this.notifications.get(teamName) || [];
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  markAsRead(teamName: string, notificationId: string): boolean {
    const notifications = this.notifications.get(teamName);
    if (!notifications) return false;

    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  markAllAsRead(teamName: string): number {
    const notifications = this.notifications.get(teamName);
    if (!notifications) return 0;

    const unreadCount = notifications.filter(n => !n.read).length;
    notifications.forEach(n => n.read = true);
    return unreadCount;
  }

  getUnreadCount(teamName: string): number {
    const notifications = this.notifications.get(teamName) || [];
    return notifications.filter(n => !n.read).length;
  }

  async updateTeamSubscription(teamName: string, subscription: Partial<TeamSubscription>): Promise<void> {
    const existing = await databaseService.getTeamSubscription(teamName) || {
      teamName,
      email: '',
      tokenChanges: true,
      patternUpdates: true,
      scanResults: true,
      approvalRequests: true
    };

    await databaseService.saveTeamSubscription({ ...existing, ...subscription });
  }

  async getTeamSubscription(teamName: string): Promise<TeamSubscription | null> {
    return await databaseService.getTeamSubscription(teamName);
  }

  async getAllSubscriptions(): Promise<TeamSubscription[]> {
    return await databaseService.getTeamSubscriptions();
  }

  async removeTeamSubscription(teamName: string): Promise<boolean> {
    try {
      await databaseService.deleteTeamSubscription(teamName);
      return true;
    } catch (error) {
      console.error('Error deleting team subscription:', error);
      return false;
    }
  }

  private async getTargetTeams(notification: NotificationData): Promise<string[]> {
    const allTeams = await databaseService.getTeamSubscriptions();
    const teamNames = allTeams.map(team => team.teamName);
    
    if (notification.metadata?.teamName) {
      return [notification.metadata.teamName];
    }

    if (notification.type === 'system_alert' || notification.type === 'scan_complete') {
      return teamNames;
    }

    return teamNames;
  }

  private async sendExternalNotifications(notification: NotificationData, targetTeams: string[]): Promise<void> {
    for (const teamName of targetTeams) {
      const subscription = await databaseService.getTeamSubscription(teamName);
      if (!subscription) continue;

      const wantsNotification = this.shouldSendNotification(notification.type, subscription);
      if (!wantsNotification) continue;

      if (subscription.email) {
        try {
          const emailSent = await emailService.sendNotification(notification, subscription.email, teamName);
          if (emailSent) {
            console.log(`✅ Email notification sent to ${teamName} (${subscription.email})`);
          } else {
            console.log(`❌ Failed to send email notification to ${teamName} (${subscription.email})`);
          }
        } catch (error) {
          console.error(`❌ Failed to send email to ${teamName}:`, error);
        }
      }
    }
  }

  private shouldSendNotification(type: NotificationData['type'], subscription: TeamSubscription): boolean {
    switch (type) {
      case 'token_change':
        return subscription.tokenChanges;
      case 'pattern_update':
        return subscription.patternUpdates;
      case 'scan_complete':
        return subscription.scanResults;
      case 'approval_required':
        return subscription.approvalRequests;
      case 'system_alert':
        return true;
      default:
        return false;
    }
  }

  async notifyTokenChange(tokenName: string, oldValue: string, newValue: string, affectedTeams: string[], affectedFiles: string[]): Promise<void> {
    await this.createNotification({
      type: 'token_change',
      title: `Token "${tokenName}" Updated`,
      message: `Design token value changed from "${oldValue}" to "${newValue}". ${affectedFiles.length} files may be affected.`,
      severity: 'warning',
      metadata: {
        tokenName,
        oldValue,
        newValue,
        affectedFiles
      },
      actionUrl: `/tokens/${encodeURIComponent(tokenName)}`
    });
  }

  async notifyScanComplete(scanId: string, results: { 
    tokensFound: number; 
    newTokens: number; 
    issues: number;
    tokenChanges?: TokenChange[];
    repositoryName?: string;
  }): Promise<void> {
    const { tokenChanges = [], repositoryName } = results;
    
    if (repositoryName === 'canon-design-system' && tokenChanges.length > 0) {
      await this.notifyDesignSystemChanges(scanId, tokenChanges);
    } else {
      await this.createNotification({
        type: 'scan_complete',
        title: 'Token Scan Completed',
        message: `Found ${results.tokensFound} tokens (${results.newTokens} new). ${results.issues} issues detected.`,
        severity: results.issues > 0 ? 'warning' : 'success',
        metadata: {
          scanId,
          repositoryName
        },
        actionUrl: '/'
      });
    }
  }

  async notifyDesignSystemChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void> {
    const addedTokens = tokenChanges.filter(t => t.type === 'added');
    const updatedTokens = tokenChanges.filter(t => t.type === 'updated');
    const removedTokens = tokenChanges.filter(t => t.type === 'removed');

    let message = 'Canon Design System has been updated:\n';
    if (addedTokens.length > 0) {
      message += `\n✅ ${addedTokens.length} token(s) added`;
    }
    if (updatedTokens.length > 0) {
      message += `\n🔄 ${updatedTokens.length} token(s) updated`;
    }
    if (removedTokens.length > 0) {
      message += `\n❌ ${removedTokens.length} token(s) removed`;
    }

    const allTeams = await databaseService.getTeamSubscriptions();
    const subscribedTeams = allTeams
      .filter(sub => sub.tokenChanges)
      .map(sub => sub.teamName);

    for (const teamName of subscribedTeams) {
      await this.createNotification({
        type: 'token_change',
        title: 'Design System Updated',
        message: message.trim(),
        severity: removedTokens.length > 0 ? 'warning' : 'info',
        metadata: {
          scanId,
          tokenChanges,
          repositoryName: 'canon-design-system'
        },
        actionUrl: '/'
      });
    }
  }

  async notifyApprovalRequired(requestId: string, teamName: string, tokenName: string): Promise<void> {
    await this.createNotification({
      type: 'approval_required',
      title: 'Token Change Approval Required',
      message: `Team "${teamName}" requested approval for changes to "${tokenName}".`,
      severity: 'info',
      metadata: {
        requestId,
        teamName,
        tokenName
      },
      actionUrl: `/change-requests/${requestId}`
    });
  }
}

export const notificationService = new NotificationService();
