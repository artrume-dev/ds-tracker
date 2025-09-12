import { Router, Request, Response } from 'express';
import { scannerService } from '../scanner/ScannerService';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router: Router = Router();

// GET /api/scans - Get scan history and statistics
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const [history, statistics, latestResults] = await Promise.all([
      scannerService.getScanHistory(10),
      scannerService.getScanStatistics(),
      scannerService.getLatestScanResults()
    ]);

    res.json({
      success: true,
      data: {
        history,
        statistics,
        latest: latestResults
      }
    });
  } catch (error) {
    console.error('Error fetching scan data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_FETCH_ERROR',
        message: 'Failed to fetch scan data'
      }
    });
  }
});

// POST /api/scans/run - Trigger a new scan
router.post('/run', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { type = 'full', team, repository } = req.body;

    let result;

    switch (type) {
      case 'full':
        result = await scannerService.runFullScan();
        break;
      case 'team':
        if (!team) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_TEAM',
              message: 'Team name is required for team scan'
            }
          });
        }
        result = await scannerService.runTeamScan(team);
        break;
      case 'repository':
        if (!repository || !team) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_PARAMS',
              message: 'Repository URL and team name are required for repository scan'
            }
          });
        }
        result = await scannerService.runRepositoryScan(repository, team);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SCAN_TYPE',
            message: 'Scan type must be one of: full, team, repository'
          }
        });
    }

    res.json({
      success: true,
      data: result,
      message: `${type} scan completed successfully`
    });

  } catch (error) {
    console.error('Error running scan:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to execute scan'
      }
    });
  }
});

// GET /api/scans/latest - Get latest scan results
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const results = await scannerService.getLatestScanResults();
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching latest scan:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LATEST_SCAN_ERROR',
        message: 'Failed to fetch latest scan results'
      }
    });
  }
});

// GET /api/scans/statistics - Get scan statistics for dashboard
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = await scannerService.getScanStatistics();
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching scan statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATISTICS_ERROR',
        message: 'Failed to fetch scan statistics'
      }
    });
  }
});

// POST /api/scans/schedule - Schedule automated scans
router.post('/schedule', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { frequency, teams } = req.body;

    if (!frequency || !['hourly', 'daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FREQUENCY',
          message: 'Frequency must be one of: hourly, daily, weekly'
        }
      });
    }

    const schedule = await scannerService.scheduleAutomatedScan(frequency, teams);

    res.json({
      success: true,
      data: schedule,
      message: 'Automated scan scheduled successfully'
    });

  } catch (error) {
    console.error('Error scheduling scan:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCHEDULE_ERROR',
        message: 'Failed to schedule automated scan'
      }
    });
  }
});

// GET /api/scans/token/:tokenName - Get detailed usage for specific token
router.get('/token/:tokenName', async (req: Request, res: Response) => {
  try {
    const { tokenName } = req.params;
    const details = await scannerService.getTokenUsageDetails(tokenName);

    res.json({
      success: true,
      data: details
    });
  } catch (error) {
    console.error('Error fetching token details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOKEN_DETAILS_ERROR',
        message: 'Failed to fetch token usage details'
      }
    });
  }
});

export default router;
