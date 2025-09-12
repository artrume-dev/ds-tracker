// In-memory database service for team subscriptions and notifications
// This provides all the functionality without external database dependencies

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

export class DatabaseService {
  private teamSubscriptions: Map<string, TeamSubscription> = new Map();
  private emailConfig: EmailConfig | null = null;
  private notifications: Map<string, Notification> = new Map();
  private scanResults: Map<string, any> = new Map();
  private gitCommits: Map<string, string> = new Map(); // repository -> last commit

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with some default team subscriptions
    const defaultTeams: TeamSubscription[] = [
      {
        teamName: 'Design Team',
        email: 'design@company.com',
        tokenChanges: true,
        patternUpdates: true,
        scanResults: true,
        approvalRequests: true
      },
      {
        teamName: 'Frontend Team',
        email: 'frontend@company.com',
        tokenChanges: true,
        patternUpdates: false,
        scanResults: true,
        approvalRequests: false
      },
      {
        teamName: 'Design System Ops',
        email: 'ds-ops@company.com',
        tokenChanges: true,
        patternUpdates: true,
        scanResults: true,
        approvalRequests: true
      }
    ];

    defaultTeams.forEach(team => {
      this.teamSubscriptions.set(team.teamName, team);
    });

    console.log('✅ In-memory database initialized with default data');
  }

  // Team Subscriptions
  async getTeamSubscriptions(): Promise<TeamSubscription[]> {
    return Array.from(this.teamSubscriptions.values());
  }

  async getTeamSubscription(teamName: string): Promise<TeamSubscription | null> {
    return this.teamSubscriptions.get(teamName) || null;
  }

  async saveTeamSubscription(subscription: TeamSubscription): Promise<void> {
    this.teamSubscriptions.set(subscription.teamName, subscription);
    console.log(`✅ Team subscription saved for ${subscription.teamName}`);
  }

  async deleteTeamSubscription(teamName: string): Promise<void> {
    this.teamSubscriptions.delete(teamName);
    console.log(`✅ Deleted team subscription for ${teamName}`);
  }

  // Email Configuration
  async getEmailConfig(): Promise<EmailConfig | null> {
    return this.emailConfig;
  }

  async saveEmailConfig(config: EmailConfig): Promise<void> {
    this.emailConfig = config;
    console.log('✅ Saved email configuration');
  }

  // Notifications
  async getNotificationsForTeam(teamName: string): Promise<Notification[]> {
    const teamNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.teamName === teamName)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50); // Limit to 50 recent notifications
    
    return teamNotifications;
  }

  async saveNotification(notification: Notification): Promise<void> {
    this.notifications.set(notification.id, notification);
    console.log(`✅ Saved notification: ${notification.title}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
      console.log(`✅ Marked notification as read: ${notificationId}`);
    }
  }

  // Scan Results
  async saveScanResult(scanId: string, result: any): Promise<void> {
    this.scanResults.set(scanId, result);
    console.log(`✅ Saved scan result: ${scanId}`);
  }

  async getScanResult(scanId: string): Promise<any> {
    return this.scanResults.get(scanId) || null;
  }

  async getAllScanResults(): Promise<any[]> {
    return Array.from(this.scanResults.values());
  }

  // Git commit tracking
  async getLastProcessedCommit(repository: string): Promise<string | null> {
    return this.gitCommits.get(repository) || null;
  }

  async markCommitAsProcessed(repository: string, commitHash: string): Promise<void> {
    this.gitCommits.set(repository, commitHash);
    console.log(`✅ Commit marked as processed: ${commitHash}`);
  }
}

export const databaseService = new DatabaseService();
