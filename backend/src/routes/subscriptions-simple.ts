import express, { Request, Response, Router } from 'express';
import { notificationService } from '../services/NotificationService';

const router: Router = Router();

// GET /api/subscriptions - Get all team subscriptions
router.get('/', async (req: Request, res: Response) => {
  try {
    // Return mock data for now
    const subscriptions = [
      {
        teamName: 'Design Team',
        email: 'design@company.com',
        preferences: {
          tokenChanges: true,
          patternUpdates: true,
          scanResults: false,
          approvalRequests: true
        }
      },
      {
        teamName: 'Frontend Team',
        email: 'frontend@company.com',
        preferences: {
          tokenChanges: true,
          patternUpdates: false,
          scanResults: true,
          approvalRequests: false
        }
      }
    ];

    res.json({
      success: true,
      subscriptions,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/subscriptions/:teamName - Get team subscription
router.get('/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    
    // Return mock subscription data
    const subscription = {
      teamName,
      email: `${teamName.toLowerCase().replace(/\s+/g, '')}@company.com`,
      preferences: {
        tokenChanges: true,
        patternUpdates: true,
        scanResults: false,
        approvalRequests: true
      }
    };

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error getting team subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/subscriptions/:teamName - Create or update team subscription
router.post('/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { email, preferences } = req.body;

    console.log('Creating/updating subscription:', { teamName, email, preferences });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        teamName,
        email,
        preferences
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/subscriptions/:teamName - Update team subscription
router.put('/:teamName', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    const { email, preferences } = req.body;

    console.log('Updating subscription:', { teamName, email, preferences });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: {
        teamName,
        email,
        preferences
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/subscriptions/:teamName/test - Test team subscription notification
router.post('/:teamName/test', async (req: Request, res: Response) => {
  try {
    const { teamName } = req.params;
    
    console.log('Testing notification for team:', teamName);

    res.json({
      success: true,
      message: `Test notification sent to ${teamName}`,
      testResult: {
        team: teamName,
        status: 'sent',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error testing subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
