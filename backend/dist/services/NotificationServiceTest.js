"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationServiceTest = exports.NotificationServiceTest = void 0;
const events_1 = require("events");
class NotificationServiceTest extends events_1.EventEmitter {
    async notifyDesignSystemChanges(scanId, tokenChanges) {
        console.log('🔔 Test notification: Design system changes detected', { scanId, changeCount: tokenChanges.length });
    }
    async notifyScanComplete(scanId, data) {
        console.log('✅ Test notification: Scan completed', { scanId, data });
    }
    async notifyTokenChanges(scanId, tokenChanges) {
        console.log('🪙 Test notification: Token changes', { scanId, changeCount: tokenChanges.length });
    }
    async sendExternalNotifications(notification) {
        console.log('📧 Test notification: External notification sent', notification);
    }
    async createNotification(data) {
        console.log('📝 Test notification: Created notification', data);
        return { id: 'test-notification-' + Date.now(), ...data };
    }
}
exports.NotificationServiceTest = NotificationServiceTest;
exports.notificationServiceTest = new NotificationServiceTest();
//# sourceMappingURL=NotificationServiceTest.js.map