export const emailService = {
  async sendNotification(notification: any): Promise<void> {
    console.log('📧 Email notification sent:', notification);
    // TODO: Implement actual email sending (SMTP, SendGrid, etc.)
  }
};
