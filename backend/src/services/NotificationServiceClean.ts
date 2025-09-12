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

  /**
   * Initialize default team subscriptions
   */
  private async initializeTeamSubscriptions() {
    console.log('🏗️ Initializing team subscriptions...');
    
    try {
      // Check if teams already exist in database
      const existingTeams = await databaseService.getTeamSubscriptions();
      if (existingTeams.length > 0) {
        console.log(`✅ Found ${existingTeams.length} existing team subscriptions`);
        return;
      }

      // Setup default subscriptions for known teams
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

  /**
   * Create and send a notification
   */
  async createNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string> {
    const notificationData: NotificationData = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    // Determine target teams based on notification type and metadata
    const targetTeams = await this.getTargetTeams(notificationData);
    
    // Store notification for each target team
    targetTeams.forEach(teamName => {
      if (!this.notifications.has(teamName)) {
        this.notifications.set(teamName, []);
      }
      this.notifications.get(teamName)!.push(notificationData);
      
      // Keep only last 100 notifications per team
      const teamNotifications = this.notifications.get(teamName)!;
      if (teamNotifications.length > 100) {
        teamNotifications.splice(0, teamNotifications.length - 100);
      }
    });

    // Emit real-time notification event
    targetTeams.forEach(teamName => {
      this.emit('notification', {
        teamName,
        notification: notificationData
      });
    });

    // Send email/slack notifications if configured
    await this.sendExternalNotifications(notificationData, targetTeams);

    console.log(`📢 Notification created: ${notificationData.title} (${targetTeams.join(', ')})`);
    return notificationData.id;
  }

  /**
   * Get notifications for a specific team
   */
  getTeamNotifications(teamName: string, limit: number = 50): NotificationData[] {
    const notifications = this.notifications.get(teamName) || [];
    return notifications
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Mark notification as read
   */
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

  /**
   * Mark all notifications as read for a team
   */
  markAllAsRead(teamName: string): number {
    const notifications = this.notifications.get(teamName);
    if (!notifications) return 0;

    const unreadCount = notifications.filter(n => !n.read).length;
    notifications.forEach(n => n.read = true);
    return unreadCount;
  }

  /**
   * Get unread notification count for a team
   */
  getUnreadCount(teamName: string): number {
    const notifications = this.notifications.get(teamName) || [];
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Update team subscription preferences
   */
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

  /**
   * Get team subscription settings
   */
  async getTeamSubscription(teamName: string): Promise<TeamSubscription | null> {
    return await databaseService.getTeamSubscription(teamName);
  }

  /**
   * Get all team subscriptions
   */
  async getAllSubscriptions(): Promise<TeamSubscription[]> {
    return await databaseService.getTeamSubscriptions();
  }

  /**
   * Remove team subscription
   */
  async removeTeamSubscription(teamName: string): Promise<boolean> {
    try {
      await databaseService.deleteTeamSubscription(teamName);
      return true;
    } catch (error) {
      console.error('Error deleting team subscription:', error);
      return false;
    }
  }

  /**
   * Determine which teams should receive this notification
   */
  private async getTargetTeams(notification: NotificationData): Promise<string[]> {
    const allTeams = await databaseService.getTeamSubscriptions();
    const teamNames = allTeams.map(team => team.teamName);
    
    // If team is specified in metadata, target that team
    if (notification.metadata?.teamName) {
      return [notification.metadata.teamName];
    }

    // For system-wide notifications, target all teams
    if (notification.type === 'system_alert' || notification.type === 'scan_complete') {
      return teamNames;
    }

    // For token/pattern changes, target all teams
    return teamNames; // For now, send to all teams - could be refined based on usage data
  }

  /**
   * Send external notifications (email, Slack, etc.)
   */
  private async sendExternalNotifications(notification: NotificationData, targetTeams: string[]): Promise<void> {
    for (const teamName of targetTeams) {
      const subscription = await databaseService.getTeamSubscription(teamName);
      if (!subscription) continue;

      // Check if team wants this type of notification
      const wantsNotification = this.shouldSendNotification(notification.type, subscription);
      if (!wantsNotification) continue;

      // Send email notification
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

  /**
   * Check if notification should be sent based on preferences
   */
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
        return true; // Always send system alerts
      default:
        return false;
    }
  }

  /**
   * Create notifications for token changes
   */
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

  /**
   * Create notifications for scan completion
   */
  async notifyScanComplete(scanId: string, results: { 
    tokensFound: number; 
    newTokens: number; 
    issues: number;
    tokenChanges?: TokenChange[];
    repositoryName?: string;
  }): Promise<void> {
    const { tokenChanges = [], repositoryName } = results;
    
    // If this is a Design System repository update, notify all subscribed teams
    if (repositoryName === 'canon-design-system' && tokenChanges.length > 0) {
      await this.notifyDesignSystemChanges(scanId, tokenChanges);
    } else {
      // Regular scan completion notification
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

  /**
   * Notify all subscribed teams about Design System changes
   */
  async notifyDesignSystemChanges(scanId: string, tokenChanges: TokenChange[]): Promise<void> {
    const addedTokens = tokenChanges.filter(t => t.type === 'added');
    const updatedTokens = tokenChanges.filter(t => t.type === 'updated');
    const removedTokens = tokenChanges.filter(t => t.type === 'removed');

    // Create summary message
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

    // Get all subscribed teams
    const allTeams = await databaseService.getTeamSubscriptions();
    const subscribedTeams = allTeams
      .filter(sub => sub.tokenChanges)
      .map(sub => sub.teamName);

    // Create notification for each subscribed team
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

  /**
   * Create notifications for approval requests
   */
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
