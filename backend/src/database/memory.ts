// In-memory database replacement for SQLite
// This provides the same interface but stores data in memory

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

// In-memory storage
const memoryStore = {
  teamSubscriptions: new Map<string, TeamSubscription>(),
  emailConfig: null as EmailConfig | null,
  notifications: new Map<string, Notification>(),
  scanResults: new Map<string, any>(),
  gitCommits: new Map<string, any>()
};

// Initialize with default data
function initializeDefaults() {
  // Default team subscriptions
  const defaultTeams = [
    {
      teamName: 'Design Team',
      email: 'design@company.com',
      tokenChanges: true,
      patternUpdates: true,
      scanResults: false,
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
      teamName: 'Engineering',
      email: 'engineering@company.com',
      tokenChanges: true,
      patternUpdates: true,
      scanResults: true,
      approvalRequests: true
    }
  ];

  defaultTeams.forEach(team => {
    memoryStore.teamSubscriptions.set(team.teamName, team);
  });

  // Default email config
  memoryStore.emailConfig = {
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    },
    from: 'Design System <your-email@gmail.com>'
  };

  console.log('✅ In-memory database initialized with default data');
}

// Team Subscriptions
export function getTeamSubscriptions(): TeamSubscription[] {
  return Array.from(memoryStore.teamSubscriptions.values());
}

export function getTeamSubscription(teamName: string): TeamSubscription | null {
  return memoryStore.teamSubscriptions.get(teamName) || null;
}

export function upsertTeamSubscription(
  teamName: string,
  email: string,
  tokenChanges: number,
  patternUpdates: number,
  scanResults: number,
  approvalRequests: number
): void {
  const subscription: TeamSubscription = {
    teamName,
    email,
    tokenChanges: Boolean(tokenChanges),
    patternUpdates: Boolean(patternUpdates),
    scanResults: Boolean(scanResults),
    approvalRequests: Boolean(approvalRequests)
  };
  
  memoryStore.teamSubscriptions.set(teamName, subscription);
  console.log(`✅ Team subscription saved for ${teamName}`);
}

export function deleteTeamSubscription(teamName: string): void {
  memoryStore.teamSubscriptions.delete(teamName);
  console.log(`✅ Team subscription deleted for ${teamName}`);
}

// Email Configuration
export function getEmailConfig(): EmailConfig | null {
  return memoryStore.emailConfig;
}

export function upsertEmailConfig(
  provider: string,
  host: string | null,
  port: number | null,
  secure: number,
  authUser: string | null,
  authPass: string | null,
  fromEmail: string | null
): void {
  memoryStore.emailConfig = {
    provider,
    host: host || undefined,
    port: port || undefined,
    secure: Boolean(secure),
    auth: authUser && authPass ? {
      user: authUser,
      pass: authPass
    } : undefined,
    from: fromEmail || undefined
  };
  console.log('✅ Email configuration saved');
}

// Notifications
export function getNotificationsForTeam(teamName: string): Notification[] {
  return Array.from(memoryStore.notifications.values())
    .filter(notification => notification.teamName === teamName);
}

export function saveNotification(notification: Notification): void {
  memoryStore.notifications.set(notification.id, notification);
  console.log(`✅ Notification saved: ${notification.title}`);
}

export function markNotificationAsRead(notificationId: string): void {
  const notification = memoryStore.notifications.get(notificationId);
  if (notification) {
    notification.read = true;
    memoryStore.notifications.set(notificationId, notification);
    console.log(`✅ Notification marked as read: ${notificationId}`);
  }
}

// Scan Results (for token scanner)
export function saveScanResult(scanId: string, result: any): void {
  memoryStore.scanResults.set(scanId, result);
  console.log(`✅ Scan result saved: ${scanId}`);
}

export function getScanResult(scanId: string): any {
  return memoryStore.scanResults.get(scanId);
}

export function getAllScanResults(): any[] {
  return Array.from(memoryStore.scanResults.values());
}

// Git Commits (for tracking changes)
export function saveGitCommit(commitHash: string, data: any): void {
  memoryStore.gitCommits.set(commitHash, data);
}

export function getGitCommit(commitHash: string): any {
  return memoryStore.gitCommits.get(commitHash);
}

// Initialize on import
initializeDefaults();

export default memoryStore;
