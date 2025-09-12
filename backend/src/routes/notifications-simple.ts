import express, { Request, Response, Router } from 'express';
import { notificationService } from '../services/NotificationService';

const router: Router = Router();

// Simple health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Notification service is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Notification health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Basic notification endpoint (simplified for now)
router.post('/test', async (req: Request, res: Response) => {
  try {
    console.log('Test notification received:', req.body);
    res.json({
      success: true,
      message: 'Test notification processed'
    });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/notifications/team/:teamName - Get notifications for a team
router.get('/team/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    
    // For now, return mock data
    const notifications = [
      {
        id: '1',
        type: 'token_change',
        title: 'Design System Updated',
        message: `New tokens available for ${teamName}`,
        timestamp: new Date().toISOString(),
        read: false
      }
    ];

    res.json({
      success: true,
      notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Get team notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
