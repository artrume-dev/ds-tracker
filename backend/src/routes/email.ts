import { Router, Request, Response } from 'express';
import { emailService } from '../services/EmailService';

const router: Router = Router();

// Store email configuration data
let emailConfigData: any = null;

// Get email service status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = emailService.getStatus();
    
    // If we have stored configuration but EmailService shows not initialized,
    // this means server was restarted and config was lost
    if (emailConfigData && status.status === 'not_initialized') {
      console.log('📧 Found stored config, reinitializing EmailService...');
      
      // Reinitialize with stored config
      const emailConfig = {
        provider: emailConfigData.provider,
        auth: emailConfigData.auth || {},
        smtp: emailConfigData.smtp || {},
        from: emailConfigData.from || emailConfigData.auth?.user || 'noreply@canon.com'
      };
      
      await emailService.initialize(emailConfig);
      
      // Get updated status
      const updatedStatus = emailService.getStatus();
      return res.json({
        success: true,
        data: updatedStatus
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_STATUS_ERROR',
        message: 'Failed to get email service status'
      }
    });
  }
});

// Get email configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const status = emailService.getStatus();
    res.json({
      success: true,
      data: {
        provider: status.provider,
        status: status.status,
        hasTransporter: status.hasTransporter || false,
        lastCheck: status.lastCheck,
        config: emailConfigData || {}
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_CONFIG_ERROR',
        message: 'Failed to get email configuration'
      }
    });
  }
});

// Email configuration endpoints
router.post('/config', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    console.log('📧 Received email config:', JSON.stringify(config, null, 2));
    
    // Validate required fields based on provider type
    if (!config.provider) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'Email provider is required'
        }
      });
    }

    if (config.provider === 'smtp' && (!config.host || !config.auth?.user)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'SMTP configuration requires host and user'
        }
      });
    }

    if (config.provider === 'gmail' && (!config.auth || !config.auth.user || !config.auth.pass)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'Gmail configuration requires user and password'
        }
      });
    }

    if (config.provider === 'outlook' && (!config.auth || !config.auth.user || !config.auth.pass)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'Outlook configuration requires user and password'
        }
      });
    }

    if (config.provider === 'sendgrid' && (!config.auth || !config.auth.user || !config.auth.pass)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'SendGrid configuration requires API key as user and password'
        }
      });
    }

    // Store the configuration
    emailConfigData = config;
    console.log('📧 Email config stored successfully');
    
    // Convert frontend format to EmailService format
    const emailConfig = {
      provider: config.provider,
      auth: config.auth || {},
      smtp: {
        host: config.host,
        port: config.port || 587,
        secure: config.secure || false,
        user: config.auth?.user,
        pass: config.auth?.pass
      },
      from: config.from || config.auth?.user || 'noreply@canon.com'
    };
    
    // Re-initialize email service with new config
    await emailService.initialize(emailConfig);
    console.log('📧 Email service reinitialized');
    
    const status = emailService.getStatus();
    
    res.json({
      success: true,
      data: {
        message: 'Email configuration saved successfully',
        status: status
      }
    });
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_CONFIG_SAVE_ERROR',
        message: `Failed to save email configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });
  }
});

// Legacy route for backward compatibility
router.post('/configure', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    console.log('📧 Legacy configure endpoint - received config:', JSON.stringify(config, null, 2));
    
    // Validate required fields - support both new 'provider' and legacy 'type' fields
    const providerType = config.provider || config.type;
    
    if (!providerType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'Email provider/type is required'
        }
      });
    }

    // Validate Gmail configuration
    if (providerType === 'gmail' && (!config.auth || !config.auth.user || !config.auth.pass)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'Gmail configuration requires user and password in auth object'
        }
      });
    }

    // Validate SMTP configuration
    if (providerType === 'smtp' && (!config.smtp || !config.smtp.host || !config.smtp.user)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL_CONFIG',
          message: 'SMTP configuration requires host and user'
        }
      });
    }

    // Store the configuration
    emailConfigData = config;
    console.log('📧 Legacy - Email config stored successfully');
    
    // Convert to EmailService format
    const emailConfig = {
      provider: providerType,
      auth: config.auth || {},
      smtp: config.smtp || {},
      from: config.from || config.auth?.user || 'noreply@canon.com'
    };
    
    // Re-initialize email service with new config
    await emailService.initialize(emailConfig);
    console.log('📧 Legacy - Email service reinitialized');
    
    res.json({
      success: true,
      data: {
        message: 'Email configuration saved successfully',
        status: emailService.getStatus()
      }
    });
  } catch (error) {
    console.error('❌ Legacy email configuration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_CONFIG_SAVE_ERROR',
        message: `Failed to save email configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });
  }
});

// Test email service configuration
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_RECIPIENT',
          message: 'Email recipient is required'
        }
      });
    }

    const result = await emailService.sendTestEmail(to);
    
    res.json({
      success: true,
      data: {
        sent: result,
        recipient: to,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_TEST_ERROR',
        message: 'Failed to send test email'
      }
    });
  }
});

// Test email service connection
router.get('/test-connection', async (req: Request, res: Response) => {
  try {
    const result = await emailService.testConnection();
    
    res.json({
      success: true,
      data: {
        connected: result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_CONNECTION_ERROR',
        message: 'Failed to test email connection'
      }
    });
  }
});

export default router;
