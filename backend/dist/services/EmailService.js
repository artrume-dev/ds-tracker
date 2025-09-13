"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer = __importStar(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = null;
        this.config = null;
        this.isInitialized = false;
    }
    async initialize(config) {
        try {
            // Use provided config or fallback to environment variables
            this.config = config || this.getConfigFromEnv();
            if (!this.config) {
                console.log('📧 No email configuration provided, using mock mode');
                this.isInitialized = true;
                return;
            }
            if (this.config.provider === 'mock') {
                console.log('📧 Email service initialized in mock mode');
                this.isInitialized = true;
                return;
            }
            // Create transporter based on provider
            if (this.config.provider === 'gmail') {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: this.config.auth
                });
            }
            else if (this.config.provider === 'smtp' && this.config.smtp) {
                this.transporter = nodemailer.createTransport({
                    host: this.config.smtp.host,
                    port: this.config.smtp.port,
                    secure: this.config.smtp.secure,
                    auth: this.config.auth
                });
            }
            if (this.transporter) {
                // Test the connection
                await this.transporter.verify();
                console.log('✅ Email service initialized successfully with', this.config.provider);
            }
            this.isInitialized = true;
        }
        catch (error) {
            console.error('❌ Failed to initialize email service:', error);
            // Fallback to mock mode on failure
            this.config = { ...this.config, provider: 'mock' };
            this.isInitialized = true;
            console.log('📧 Falling back to mock email mode');
        }
    }
    getConfigFromEnv() {
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpPort = process.env.SMTP_PORT;
        const emailFrom = process.env.EMAIL_FROM;
        if (!smtpUser || !smtpPass || !emailFrom) {
            return null;
        }
        if (smtpHost) {
            return {
                provider: 'smtp',
                auth: { user: smtpUser, pass: smtpPass },
                smtp: {
                    host: smtpHost,
                    port: parseInt(smtpPort || '587'),
                    secure: false
                },
                from: emailFrom
            };
        }
        else {
            // Assume Gmail if no host provided
            return {
                provider: 'gmail',
                auth: { user: smtpUser, pass: smtpPass },
                from: emailFrom
            };
        }
    }
    async sendNotification(notification, email, teamName) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (!this.config || this.config.provider === 'mock' || !this.transporter) {
            console.log(`📧 Mock notification sent to ${email} for team ${teamName}`);
            return true;
        }
        try {
            const emailContent = this.buildNotificationEmail(notification, teamName);
            const mailOptions = {
                from: this.config.from,
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email notification sent to ${teamName} (${email}):`, info.messageId);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to send email to ${teamName} (${email}):`, error);
            return false;
        }
    }
    async sendNotificationEmail() {
        // Legacy method for backward compatibility
        console.log('📧 Generic notification email sent');
        return true;
    }
    async sendTestEmail(to) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (!this.config || this.config.provider === 'mock' || !this.transporter) {
            console.log(`📧 Mock test email sent to ${to}`);
            return true;
        }
        try {
            const mailOptions = {
                from: this.config.from,
                to: to,
                subject: 'Design Tokens Tracker - Test Email',
                html: `
          <h2>Test Email from Design Tokens Tracker</h2>
          <p>This is a test email to verify email configuration.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p><strong>Service:</strong> ${this.config.provider}</p>
        `,
                text: `
          Test Email from Design Tokens Tracker
          
          This is a test email to verify email configuration.
          
          Sent at: ${new Date().toISOString()}
          Service: ${this.config.provider}
        `
            };
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Test email sent to ${to}:`, info.messageId);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to send test email to ${to}:`, error);
            return false;
        }
    }
    async testConnection() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        if (!this.config || this.config.provider === 'mock' || !this.transporter) {
            console.log('� Mock email connection test passed');
            return true;
        }
        try {
            await this.transporter.verify();
            console.log('✅ Email connection test passed');
            return true;
        }
        catch (error) {
            console.error('❌ Email connection test failed:', error);
            return false;
        }
    }
    getStatus() {
        const status = {
            status: this.isInitialized ? 'connected' : 'not_initialized',
            provider: this.config?.provider || 'unknown',
            lastCheck: new Date().toISOString(),
            hasTransporter: !!this.transporter
        };
        console.log('📧 EmailService status requested:', JSON.stringify(status, null, 2));
        return status;
    }
    buildNotificationEmail(notification, teamName) {
        console.log(`🔍 DEBUG Email Builder: Building email for ${teamName}`);
        console.log(`📧 DEBUG: Notification message length: ${notification.message?.length || 0}`);
        console.log(`📧 DEBUG: Has gitChanges in metadata: ${!!notification.metadata?.gitChanges}`);
        console.log(`📧 DEBUG: First 200 chars of message: "${notification.message?.substring(0, 200)}..."`);
        const subject = `${notification.title} - Design Tokens Tracker`;
        let tokenChangesHtml = '';
        let tokenChangesText = '';
        if (notification.metadata?.tokenChanges && notification.metadata.tokenChanges.length > 0) {
            tokenChangesHtml = `
        <h3>Token Changes:</h3>
        <ul>
          ${notification.metadata.tokenChanges.map(change => `<li><strong>${change.type.toUpperCase()}:</strong> ${change.tokenName}
              ${change.oldValue ? `<br>Old: <code>${change.oldValue}</code>` : ''}
              ${change.newValue ? `<br>New: <code>${change.newValue}</code>` : ''}
              ${change.affectedFiles ? `<br>Files: ${change.affectedFiles.length}` : ''}
            </li>`).join('')}
        </ul>
      `;
            tokenChangesText = `
        
Token Changes:
${notification.metadata.tokenChanges.map(change => `- ${change.type.toUpperCase()}: ${change.tokenName}
    ${change.oldValue ? `Old: ${change.oldValue}` : ''}
    ${change.newValue ? `New: ${change.newValue}` : ''}
    ${change.affectedFiles ? `Files: ${change.affectedFiles.length}` : ''}`).join('\n')}
      `;
        }
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          ${notification.title}
        </h2>
        
        <p><strong>Team:</strong> ${teamName}</p>
        <p><strong>Severity:</strong> <span style="color: ${this.getSeverityColor(notification.severity)};">${notification.severity.toUpperCase()}</span></p>
        <p><strong>Time:</strong> ${notification.timestamp.toISOString()}</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p>${notification.message}</p>
        </div>
        
        ${tokenChangesHtml}
        
        ${notification.metadata?.repositoryName ? `<p><strong>Repository:</strong> ${notification.metadata.repositoryName}</p>` : ''}
        ${notification.metadata?.scanId ? `<p><strong>Scan ID:</strong> ${notification.metadata.scanId}</p>` : ''}
        
        ${notification.actionUrl ? `
          <div style="margin: 20px 0;">
            <a href="${notification.actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Details
            </a>
          </div>
        ` : ''}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
          This email was sent by the Design Tokens Usage Tracker system.
        </p>
      </div>
    `;
        const text = `
${notification.title}

Team: ${teamName}
Severity: ${notification.severity.toUpperCase()}
Time: ${notification.timestamp.toISOString()}

${notification.message}

${tokenChangesText}

${notification.metadata?.repositoryName ? `Repository: ${notification.metadata.repositoryName}` : ''}
${notification.metadata?.scanId ? `Scan ID: ${notification.metadata.scanId}` : ''}

${notification.actionUrl ? `View Details: ${notification.actionUrl}` : ''}

This email was sent by the Design Tokens Usage Tracker system.
    `;
        return { subject, html, text };
    }
    getSeverityColor(severity) {
        switch (severity) {
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'success': return '#28a745';
            case 'info':
            default: return '#17a2b8';
        }
    }
}
// Export singleton instance
exports.emailService = new EmailService();
//# sourceMappingURL=EmailService.js.map