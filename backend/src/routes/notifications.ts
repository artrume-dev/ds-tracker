import express, { Request, Response, Router } from 'express';
import { notificationService } from '../services/NotificationService';
import { designSystemScanService } from '../services/DesignSystemScanService';

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

// POST /api/notifications/test-ds-token-changes - Test Design System team introduces token changes
router.post('/test-ds-token-changes', async (req: Request, res: Response) => {
  try {
    const tokenChanges = [
      {
        type: 'added' as const,
        tokenName: 'color-accent-600',
        newValue: '#6366f1',
        category: 'semantic',
        description: 'New accent color for interactive elements',
        filePath: 'tokens/colors/semantic.json'
      },
      {
        type: 'updated' as const,
        tokenName: 'spacing-large',
        oldValue: '24px',
        newValue: '32px',
        category: 'foundation',
        description: 'Increased for better visual hierarchy',
        filePath: 'tokens/spacing/foundation.json'
      }
    ];

    const scanId = `test-change-${Date.now()}`;
    await notificationService.notifyDesignSystemChanges(scanId, tokenChanges);

    res.json({
      success: true,
      message: 'Test Design System changes notification sent to all teams',
      details: {
        scenario: 'DS team introduces token changes',
        scanId: scanId,
        changesCount: tokenChanges.length,
        teamsNotified: 'All subscribed teams',
        includesReviewOptions: true
      }
    });
  } catch (error) {
    console.error('Error in test DS token changes:', error);
    res.status(500).json({ success: false, error: 'Test failed' });
  }
});

// POST /api/notifications/scan/test-change - Test the git change detection system with real data
router.post('/scan/test-change', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Testing git change detection system...');
    
    // Trigger a manual scan which will detect recent changes and send notifications
    const scanResult = await designSystemScanService.performScan();
    
    res.json({
      success: scanResult.success,
      message: scanResult.message,
      data: {
        scenario: 'Git change detection triggered manual scan',
        scanId: scanResult.scanId,
        commitsFound: scanResult.gitChanges?.length || 0,
        tokenChangesFound: scanResult.tokenChanges?.length || 0,
        notifiedTeams: 'All subscribed teams'
      }
    });
  } catch (error) {
    console.error('Error in git change detection test:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_GIT_CHANGE_ERROR',
        message: 'Failed to test git change detection'
      }
    });
  }
});

// POST /api/notifications/scan/manual - Trigger manual scan with git change detection
router.post('/scan/manual', async (req: Request, res: Response) => {
  try {
    console.log('🚀 Manual scan triggered via API...');
    
    const scanResult = await designSystemScanService.performScan();
    
    res.json({
      success: scanResult.success,
      message: scanResult.message,
      data: {
        scanId: scanResult.scanId,
        commitsFound: scanResult.gitChanges?.length || 0,
        tokenChanges: scanResult.tokenChanges?.length || 0,
        gitChanges: scanResult.gitChanges,
        tokenChangeDetails: scanResult.tokenChanges
      }
    });
  } catch (error) {
    console.error('Error in manual scan:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MANUAL_SCAN_ERROR',
        message: 'Failed to perform manual scan'
      }
    });
  }
});

export default router;
