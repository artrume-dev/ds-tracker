"use strict";
// In-memory database service for team subscriptions and notifications
// This provides all the functionality without external database dependencies
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = exports.DatabaseService = void 0;
class DatabaseService {
    constructor() {
        this.teamSubscriptions = new Map();
        this.emailConfig = null;
        this.notifications = new Map();
        this.scanResults = new Map();
        this.gitCommits = new Map(); // repository -> last commit
        this.initializeDefaultData();
    }
    initializeDefaultData() {
        // Initialize with some default team subscriptions
        const defaultTeams = [
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
    async getTeamSubscriptions() {
        return Array.from(this.teamSubscriptions.values());
    }
    async getTeamSubscription(teamName) {
        return this.teamSubscriptions.get(teamName) || null;
    }
    async saveTeamSubscription(subscription) {
        this.teamSubscriptions.set(subscription.teamName, subscription);
        console.log(`✅ Team subscription saved for ${subscription.teamName}`);
    }
    async deleteTeamSubscription(teamName) {
        this.teamSubscriptions.delete(teamName);
        console.log(`✅ Deleted team subscription for ${teamName}`);
    }
    // Email Configuration
    async getEmailConfig() {
        return this.emailConfig;
    }
    async saveEmailConfig(config) {
        this.emailConfig = config;
        console.log('✅ Saved email configuration');
    }
    // Notifications
    async getNotificationsForTeam(teamName) {
        const teamNotifications = Array.from(this.notifications.values())
            .filter(notification => notification.teamName === teamName)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 50); // Limit to 50 recent notifications
        return teamNotifications;
    }
    async saveNotification(notification) {
        this.notifications.set(notification.id, notification);
        console.log(`✅ Saved notification: ${notification.title}`);
    }
    async markNotificationAsRead(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (notification) {
            notification.read = true;
            this.notifications.set(notificationId, notification);
            console.log(`✅ Marked notification as read: ${notificationId}`);
        }
    }
    // Scan Results
    async saveScanResult(scanId, result) {
        this.scanResults.set(scanId, result);
        console.log(`✅ Saved scan result: ${scanId}`);
    }
    async getScanResult(scanId) {
        return this.scanResults.get(scanId) || null;
    }
    async getAllScanResults() {
        return Array.from(this.scanResults.values());
    }
    // Git commit tracking
    async getLastProcessedCommit(repository) {
        return this.gitCommits.get(repository) || null;
    }
    async markCommitAsProcessed(repository, commitHash) {
        this.gitCommits.set(repository, commitHash);
        console.log(`✅ Commit marked as processed: ${commitHash}`);
    }
}
exports.DatabaseService = DatabaseService;
exports.databaseService = new DatabaseService();
//# sourceMappingURL=service.js.map