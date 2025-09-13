"use strict";
// In-memory database replacement for SQLite
// This provides the same interface but stores data in memory
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamSubscriptions = getTeamSubscriptions;
exports.getTeamSubscription = getTeamSubscription;
exports.upsertTeamSubscription = upsertTeamSubscription;
exports.deleteTeamSubscription = deleteTeamSubscription;
exports.getEmailConfig = getEmailConfig;
exports.upsertEmailConfig = upsertEmailConfig;
exports.getNotificationsForTeam = getNotificationsForTeam;
exports.saveNotification = saveNotification;
exports.markNotificationAsRead = markNotificationAsRead;
exports.saveScanResult = saveScanResult;
exports.getScanResult = getScanResult;
exports.getAllScanResults = getAllScanResults;
exports.saveGitCommit = saveGitCommit;
exports.getGitCommit = getGitCommit;
// In-memory storage
const memoryStore = {
    teamSubscriptions: new Map(),
    emailConfig: null,
    notifications: new Map(),
    scanResults: new Map(),
    gitCommits: new Map()
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
function getTeamSubscriptions() {
    return Array.from(memoryStore.teamSubscriptions.values());
}
function getTeamSubscription(teamName) {
    return memoryStore.teamSubscriptions.get(teamName) || null;
}
function upsertTeamSubscription(teamName, email, tokenChanges, patternUpdates, scanResults, approvalRequests) {
    const subscription = {
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
function deleteTeamSubscription(teamName) {
    memoryStore.teamSubscriptions.delete(teamName);
    console.log(`✅ Team subscription deleted for ${teamName}`);
}
// Email Configuration
function getEmailConfig() {
    return memoryStore.emailConfig;
}
function upsertEmailConfig(provider, host, port, secure, authUser, authPass, fromEmail) {
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
function getNotificationsForTeam(teamName) {
    return Array.from(memoryStore.notifications.values())
        .filter(notification => notification.teamName === teamName);
}
function saveNotification(notification) {
    memoryStore.notifications.set(notification.id, notification);
    console.log(`✅ Notification saved: ${notification.title}`);
}
function markNotificationAsRead(notificationId) {
    const notification = memoryStore.notifications.get(notificationId);
    if (notification) {
        notification.read = true;
        memoryStore.notifications.set(notificationId, notification);
        console.log(`✅ Notification marked as read: ${notificationId}`);
    }
}
// Scan Results (for token scanner)
function saveScanResult(scanId, result) {
    memoryStore.scanResults.set(scanId, result);
    console.log(`✅ Scan result saved: ${scanId}`);
}
function getScanResult(scanId) {
    return memoryStore.scanResults.get(scanId);
}
function getAllScanResults() {
    return Array.from(memoryStore.scanResults.values());
}
// Git Commits (for tracking changes)
function saveGitCommit(commitHash, data) {
    memoryStore.gitCommits.set(commitHash, data);
}
function getGitCommit(commitHash) {
    return memoryStore.gitCommits.get(commitHash);
}
// Initialize on import
initializeDefaults();
exports.default = memoryStore;
//# sourceMappingURL=memory.js.map