import { Router, Request, Response } from 'express';
import { scannerService } from '../scanner/ScannerService';
import { TokenCategorizer, CategorizedToken, PatternUsage } from '../utils/tokenCategorizer';

const router: Router = Router();

// GET /api/dashboard - Main dashboard data
router.get('/', async (req: Request, res: Response) => {
  try {
    const [scanResults, scanStats] = await Promise.all([
      scannerService.getLatestScanResults(),
      scannerService.getScanStatistics()
    ]);

    const dashboardData = {
      metrics: {
        totalTokens: scanResults.totalUniqueTokens,
        activeTokens: scanResults.totalUniqueTokens - 16, // Assuming 16 deprecated
        deprecatedTokens: 16,
        totalUsage: scanResults.totalTokensFound,
        weeklyGrowth: 12.5,
        criticalIssues: 0, // No actual critical issues - this was hardcoded
        teamsUsing: Object.keys(scanResults.teamUsage).length,
        coveragePercentage: scanResults.averageCoverage
      },
      
      topTokens: scanResults.topTokens.map((token: any, index: number) => {
        const category = TokenCategorizer.categorizeToken(token.name);
        return {
          rank: index + 1,
          name: token.name,
          usage: token.usage,
          category: category.category,
          subcategory: category.subcategory,
          purpose: category.purpose,
          type: category.type,
          trend: Math.random() > 0.5 ? 'up' : 'down', // Mock trend
          change: `${Math.floor(Math.random() * 20)}%`
        };
      }),
      
      teamAdoption: Object.entries(scanResults.teamUsage).map(([team, usage]: [string, unknown]) => ({
        teamName: team,
        tokensUsed: Math.floor((usage as number) / 10), // Rough estimate
        totalUsage: usage as number,
        adoptionScore: Math.floor(((usage as number) / scanResults.totalTokensFound) * 100),
        trend: 'up',
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      })),
      
      recentActivity: [
        {
          id: 1,
          type: 'scan-completed',
          message: `Completed scan for ${scanResults.totalRepositories} repositories`,
          user: 'System',
          timestamp: scanResults.scanDate,
          icon: '🔍'
        },
        {
          id: 2,
          type: 'token-updated',
          message: 'Updated color-primary-500 value',
          user: 'Sarah Chen',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: '🎨'
        },
        {
          id: 3,
          type: 'approval-requested',
          message: 'Requested approval for spacing token changes',
          user: 'Mike Johnson',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          icon: '⏳'
        },
        {
          id: 4,
          type: 'token-deprecated',
          message: 'Deprecated old-color-red token',
          user: 'Design System Team',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          icon: '⚠️'
        }
      ],
      
      scanInfo: {
        lastScan: scanResults.scanDate,
        nextScan: scanStats.nextScheduledScan,
        scanStatus: 'completed',
        repositoriesScanned: scanResults.totalRepositories,
        successRate: scanStats.successRate
      },
      
      usageTrends: {
        daily: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
          usage: Math.floor(Math.random() * 1000) + 500
        })),
        weekly: Array.from({ length: 4 }, (_, i) => ({
          week: `Week ${i + 1}`,
          usage: Math.floor(Math.random() * 5000) + 2000
        }))
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_ERROR',
        message: 'Failed to fetch dashboard data'
      }
    });
  }
});

// GET /api/dashboard/metrics - Key metrics only
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const [scanResults, scanStats] = await Promise.all([
      scannerService.getLatestScanResults(),
      scannerService.getScanStatistics()
    ]);

    const metrics = {
      totalTokens: scanResults.totalUniqueTokens,
      activeTokens: scanResults.totalUniqueTokens - 16,
      deprecatedTokens: 16,
      totalUsage: scanResults.totalTokensFound,
      teamsUsing: Object.keys(scanResults.teamUsage).length,
      coveragePercentage: scanResults.averageCoverage,
      lastScanDate: scanResults.scanDate,
      trendsThisWeek: scanStats.trendsThisWeek
    };

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_ERROR',
        message: 'Failed to fetch metrics data'
      }
    });
  }
});

// GET /api/dashboard/teams - Team adoption data
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const scanResults = await scannerService.getLatestScanResults();

    const teamData = Object.entries(scanResults.teamUsage).map(([team, usage]: [string, unknown]) => ({
      teamName: team,
      tokensUsed: Math.floor((usage as number) / 10),
      totalUsage: usage as number,
      adoptionScore: Math.floor(((usage as number) / scanResults.totalTokensFound) * 100),
      repositories: Math.floor(Math.random() * 5) + 1,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      trend: Math.random() > 0.3 ? 'up' : 'down',
      growth: `${Math.floor(Math.random() * 30)}%`
    }));

    res.json({
      success: true,
      data: teamData
    });

  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAM_DATA_ERROR',
        message: 'Failed to fetch team adoption data'
      }
    });
  }
});

// GET /api/dashboard/activity - Recent activity feed
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // In a real implementation, this would fetch from database
    const activities = [
      {
        id: 1,
        type: 'scan-completed',
        message: 'Completed full repository scan',
        user: 'System',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        icon: '🔍',
        metadata: { repositories: 5, tokensFound: 247 }
      },
      {
        id: 2,
        type: 'token-updated',
        message: 'Updated color-primary-500 value from #3b82f6 to #2563eb',
        user: 'Sarah Chen',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: '🎨',
        metadata: { tokenName: 'color-primary-500', affectedFiles: 23 }
      },
      {
        id: 3,
        type: 'team-added',
        message: 'E-commerce team joined design system',
        user: 'Admin',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        icon: '👥',
        metadata: { teamName: 'E-commerce' }
      },
      {
        id: 4,
        type: 'approval-requested',
        message: 'Requested approval for spacing token changes',
        user: 'Mike Johnson',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        icon: '⏳',
        metadata: { changeRequestId: 'cr-123', tokensAffected: 8 }
      },
      {
        id: 5,
        type: 'token-deprecated',
        message: 'Deprecated old-color-red token',
        user: 'Design System Team',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        icon: '⚠️',
        metadata: { tokenName: 'old-color-red', replacedBy: 'color-red-500' }
      }
    ].slice(0, limit);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ERROR',
        message: 'Failed to fetch activity data'
      }
    });
  }
});

// GET /api/dashboard/tokens/categorized - Categorized tokens
router.get('/tokens/categorized', async (req: Request, res: Response) => {
  try {
    const scanResults = await scannerService.getLatestScanResults();
    
    // Categorize all tokens
    const categorizedTokens: CategorizedToken[] = scanResults.topTokens.map((token: any) => {
      const category = TokenCategorizer.categorizeToken(token.name);
      return {
        tokenName: token.name,
        count: token.usage,
        category
      };
    });

    // Group by category type
    const groupedTokens = {
      raw: categorizedTokens.filter(t => t.category.type === 'raw'),
      foundation: categorizedTokens.filter(t => t.category.type === 'foundation'),
      component: categorizedTokens.filter(t => t.category.type === 'component')
    };

    // Add summary statistics
    const summary = {
      totalTokens: categorizedTokens.length,
      raw: groupedTokens.raw.length,
      foundation: groupedTokens.foundation.length,
      component: groupedTokens.component.length,
      mostUsedCategory: Object.entries(groupedTokens)
        .reduce((max, [key, tokens]) => {
          const totalUsage = tokens.reduce((sum, t) => sum + t.count, 0);
          return totalUsage > max.usage ? { type: key, usage: totalUsage } : max;
        }, { type: '', usage: 0 })
    };

    res.json({
      success: true,
      data: {
        categorizedTokens: groupedTokens,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching categorized tokens:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORIZED_TOKENS_ERROR',
        message: 'Failed to fetch categorized tokens'
      }
    });
  }
});

// GET /api/dashboard/patterns - Pattern usage analysis
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const scanResults = await scannerService.getLatestScanResults();
    
    // Get detailed scan data for pattern analysis
    const detailedScanData = await scannerService.getDetailedScanData();
    
    if (!detailedScanData || !detailedScanData.tokenUsages) {
      return res.json({
        success: true,
        data: {
          patterns: [],
          summary: {
            totalPatterns: 0,
            componentsCount: 0,
            mixinsCount: 0,
            utilitiesCount: 0
          }
        }
      });
    }

    // Analyze pattern usage
    const patterns = TokenCategorizer.analyzePatternUsage(detailedScanData.tokenUsages);

    // Group by pattern type
    const groupedPatterns = {
      components: patterns.filter(p => p.type === 'component'),
      mixins: patterns.filter(p => p.type === 'mixin'),
      utilities: patterns.filter(p => p.type === 'utility')
    };

    const summary = {
      totalPatterns: patterns.length,
      componentsCount: groupedPatterns.components.length,
      mixinsCount: groupedPatterns.mixins.length,
      utilitiesCount: groupedPatterns.utilities.length,
      mostUsedPattern: patterns[0] || null
    };

    res.json({
      success: true,
      data: {
        patterns: groupedPatterns,
        summary
      }
    });

  } catch (error) {
    console.error('Error fetching pattern data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PATTERNS_ERROR',
        message: 'Failed to fetch pattern usage data'
      }
    });
  }
});

// GET /api/dashboard/team/:teamName - Team-specific token usage
router.get('/team/:teamName', async (req: Request, res: Response) => {
  try {
    const teamName = req.params.teamName;
    
    // Get the raw scan data directly
    const fs = require('fs');
    const path = require('path');
    
    const scanReportsDir = path.join(__dirname, '../../scan-reports');
    
    if (!fs.existsSync(scanReportsDir)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_SCAN_DATA',
          message: 'No scan data available'
        }
      });
    }
    
    const files = fs.readdirSync(scanReportsDir)
      .filter((file: string) => file.startsWith('token-scan-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_SCAN_DATA',
          message: 'No scan reports found'
        }
      });
    }
    
    const latestFile = files[0];
    const filePath = path.join(scanReportsDir, latestFile);
    const scanData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Find the team's repository data
    const teamRepo = scanData.repositories?.find(
      (repo: any) => repo.repository?.team === teamName
    );

    if (!teamRepo) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: `Team '${teamName}' not found in scan data`
        }
      });
    }

    // Process team's tokens
    const teamTokens = teamRepo.tokensFound.map((token: any) => {
      const category = TokenCategorizer.categorizeToken(token.tokenName);
      return {
        tokenName: token.tokenName,
        tokenType: token.tokenType,
        totalCount: token.totalCount,
        files: token.files,
        occurrences: token.occurrences,
        category: category.category,
        subcategory: category.subcategory,
        purpose: category.purpose,
        type: category.type
      };
    });

    // Group by category type
    const groupedTokens = {
      raw: teamTokens.filter((t: any) => t.type === 'raw'),
      foundation: teamTokens.filter((t: any) => t.type === 'foundation'),
      component: teamTokens.filter((t: any) => t.type === 'component')
    };

    // Calculate usage summary
    const summary = {
      teamName: teamName,
      repository: teamRepo.repository.name,
      totalTokens: teamTokens.length,
      totalUsage: teamRepo.totalUsage,
      raw: groupedTokens.raw.length,
      foundation: groupedTokens.foundation.length,
      component: groupedTokens.component.length,
      topTokens: teamTokens
        .sort((a: any, b: any) => b.totalCount - a.totalCount)
        .slice(0, 10),
      coveragePercentage: teamRepo.coverage || 0
    };

    res.json({
      success: true,
      data: {
        summary,
        tokens: groupedTokens,
        repository: teamRepo.repository,
        patterns: teamRepo.patterns ? teamRepo.patterns.map((pattern: any) => ({
          name: pattern.patternName,
          usage: pattern.usageCount,
          trend: Math.floor(Math.random() * 21) - 10, // Simulated trend
          complexity: pattern.complexity || 'medium',
          instances: pattern.locations ? pattern.locations.map((location: any) => ({
            filePath: location,
            fileName: location.split('/').pop() || location,
            fileType: location.split('.').pop() || 'unknown',
            dependencies: pattern.tokenDependencies || []
          })) : []
        })) : []
      }
    });

  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAM_DATA_ERROR',
        message: 'Failed to fetch team-specific data'
      }
    });
  }
});

// GET /api/dashboard/trends - Token usage trends over time
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const scanReports = await scannerService.getScanHistory();
    
    // Generate trend data from historical scans or create realistic mock data
    const trendData = generateTrendData(scanReports);
    
    res.json({
      success: true,
      data: trendData
    });

  } catch (error) {
    console.error('Error fetching trend data:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TREND_DATA_ERROR',
        message: 'Failed to fetch trend data'
      }
    });
  }
});

interface TrendDataPoint {
  date: string;
  totalUsage: number;
  foundationTokens: number;
  componentTokens: number;
  rawTokens: number;
}

function generateTrendData(scanReports: any[]): TrendDataPoint[] {
  const trendData: TrendDataPoint[] = [];
  const now = new Date();
  
  // If we have scan reports, use them to generate trends
  if (scanReports && scanReports.length > 0) {
    // Group scans by date and calculate daily averages
    const scansByDate = new Map<string, any[]>();
    
    scanReports.forEach(scan => {
      const date = new Date(scan.timestamp).toDateString();
      if (!scansByDate.has(date)) {
        scansByDate.set(date, []);
      }
      scansByDate.get(date)!.push(scan);
    });
    
    // Convert to trend data points
    Array.from(scansByDate.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-30) // Last 30 days
      .forEach(([dateStr, scans]) => {
        const avgScan = scans.reduce((acc: any, scan: any) => {
          acc.totalTokensFound += scan.totalTokensFound || 0;
          acc.foundationTokens += scan.foundationTokens || 0;
          acc.componentTokens += scan.componentTokens || 0;
          acc.rawTokens += scan.rawTokens || 0;
          return acc;
        }, { totalTokensFound: 0, foundationTokens: 0, componentTokens: 0, rawTokens: 0 });
        
        Object.keys(avgScan).forEach(key => {
          avgScan[key] = Math.round(avgScan[key] / scans.length);
        });
        
        trendData.push({
          date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          totalUsage: avgScan.totalTokensFound,
          foundationTokens: avgScan.foundationTokens,
          componentTokens: avgScan.componentTokens,
          rawTokens: avgScan.rawTokens
        });
      });
  }
  
  // If no historical data or insufficient data, generate realistic mock data
  if (trendData.length < 30) {
    const mockData: TrendDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const baseUsage = 180 + i * 3; // Growing trend
      const weeklyPattern = Math.sin((i % 7) * Math.PI / 7) * 15; // Weekly variation
      const randomVariation = (Math.random() - 0.5) * 20; // Random noise
      
      const totalUsage = Math.max(50, Math.round(baseUsage + weeklyPattern + randomVariation));
      
      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalUsage,
        foundationTokens: Math.round(totalUsage * 0.55),
        componentTokens: Math.round(totalUsage * 0.30),
        rawTokens: Math.round(totalUsage * 0.15)
      });
    }
    return mockData;
  }
  
  return trendData;
}

export default router;
