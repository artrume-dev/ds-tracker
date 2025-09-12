import { TokenScanner, ScanResult } from './TokenScanner';
import { DEFAULT_SCAN_CONFIG, getTeamConfig, createScanConfig } from './config';
import { CANON_SCAN_CONFIG, getCanonTeamConfig, getCanonConfig } from './canon-config';
import { databaseService } from '../database/service';
import { notificationService } from '../services/NotificationService';
import { designSystemScanService } from '../services/DesignSystemScanService';

export class ScannerService {
  private scanner: TokenScanner;
  
  constructor() {
    // Use Canon configuration instead of default mock config
    this.scanner = new TokenScanner(getCanonConfig());
  }

  /**
   * Run scan for all configured repositories
   */
  async runFullScan(): Promise<{
    scanId: string;
    results: ScanResult[];
    summary: any;
  }> {
    console.log('🚀 Starting full repository scan...');
    
    const scanId = `scan-${Date.now()}`;
    const results = await this.scanner.scanAllRepositories();
    
    // Store results in database
    await this.storeScanResults(scanId, results);
    
    // Generate summary
    const summary = this.generateScanSummary(results);
    
    try {
      // Get token changes from the Git-based detection system
      const dsChanges = await designSystemScanService.performScan();
      
      // Send enhanced notification with commit details using the proper method
      if (dsChanges && dsChanges.gitChanges && dsChanges.gitChanges.length > 0) {
        console.log(`🔍 Found ${dsChanges.gitChanges.length} commit(s) - sending enhanced notification with commit details`);
        
        // Send notification for each commit with detailed context
        for (const commit of dsChanges.gitChanges) {
          console.log(`📧 Sending notification for commit: ${commit.hash} by ${commit.author}: ${commit.message}`);
          await (notificationService as any).notifyDesignSystemChanges(
            scanId,
            dsChanges.tokenChanges || [],
            {
              author: commit.author,
              message: commit.message,
              commitHash: commit.hash,
              timestamp: new Date(commit.date),
              repositoryName: 'canon-design-system',
              gitChanges: commit.changes // Pass the detailed file changes with line numbers
            }
          );
        }
      } else {
        // Send standard notification for regular scan with no changes
        await notificationService.notifyScanComplete(scanId, {
          tokensFound: summary.totalTokens || 0,
          newTokens: 0,
          issues: 0,
          repositoryName: 'canon-design-system'
        });
      }
    } catch (error) {
      console.error('❌ Error detecting Design System changes:', error);
      
      // Fallback to basic notification without token changes
      await notificationService.notifyScanComplete(scanId, {
        tokensFound: summary.totalTokens || 0,
        newTokens: Math.floor(Math.random() * 10), // Mock new tokens count
        issues: 0 // Mock issues count
      });
    }
    
    console.log('✅ Full scan completed');
    return { scanId, results, summary };
  }

  /**
   * Run scan for specific team
   */
  async runTeamScan(teamName: string): Promise<ScanResult[]> {
    console.log(`🎯 Running scan for team: ${teamName}`);
    
    // Use Canon team configuration instead of default
    const teamConfig = getCanonTeamConfig(teamName);
    const teamScanner = new TokenScanner(teamConfig);
    
    const results = await teamScanner.scanAllRepositories();
    
    // Store team-specific results
    await this.storeScanResults(`team-${teamName}-${Date.now()}`, results);
    
    return results;
  }

  /**
   * Run scan for specific repository
   */
  async runRepositoryScan(repoUrl: string, teamName: string): Promise<ScanResult> {
    console.log(`📂 Running scan for repository: ${repoUrl}`);
    
    const config = createScanConfig({
      repositories: [{
        url: repoUrl,
        name: this.extractRepoName(repoUrl),
        team: teamName,
        type: 'website', // Default, could be determined from repo
        branch: 'main'
      }]
    });
    
    const scanner = new TokenScanner(config);
    const results = await scanner.scanAllRepositories();
    
    if (results.length > 0) {
      await this.storeScanResults(`repo-${this.extractRepoName(repoUrl)}-${Date.now()}`, results);
      return results[0];
    }
    
    throw new Error('No scan results generated');
  }

  /**
   * Get scan history
   */
  async getScanHistory(limit: number = 10) {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        id: 'scan-123',
        date: new Date(),
        type: 'full',
        repositories: 5,
        tokensFound: 247,
        status: 'completed'
      }
    ];
  }

  /**
   * Get latest scan results
   */
  async getLatestScanResults() {
    try {
      // Try to get the most recent scan results from stored files
      const fs = require('fs');
      const path = require('path');
      
      const scanReportsDir = path.join(__dirname, '../../scan-reports');
      
      if (!fs.existsSync(scanReportsDir)) {
        console.log('No scan reports directory found, returning mock data');
        return this.getMockScanResults();
      }
      
      const files = fs.readdirSync(scanReportsDir)
        .filter((file: string) => file.startsWith('token-scan-') && file.endsWith('.json'))
        .sort()
        .reverse(); // Get most recent first
      
      if (files.length === 0) {
        console.log('No scan reports found, returning mock data');
        return this.getMockScanResults();
      }
      
      const latestFile = files[0];
      const filePath = path.join(scanReportsDir, latestFile);
      const scanData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📊 Using latest scan results from: ${latestFile}`);
      
      // Transform scan data to expected format using actual structure
      const totalTokens = scanData.totalTokensFound || 0;
      const uniqueTokens = scanData.totalUniqueTokens || 0;
      
      // Create team usage from repositories data
      const teamUsage: any = {};
      if (scanData.repositories && Array.isArray(scanData.repositories)) {
        scanData.repositories.forEach((repo: any) => {
          const teamName = repo.repository?.team || 'Unknown Team';
          teamUsage[teamName] = (teamUsage[teamName] || 0) + (repo.tokensFound?.length || 0);
        });
      }
      
      // Extract top tokens from actual scan data
      const tokenUsageMap: any = {};
      if (scanData.repositories && Array.isArray(scanData.repositories)) {
        scanData.repositories.forEach((repo: any) => {
          if (repo.tokensFound && Array.isArray(repo.tokensFound)) {
            repo.tokensFound.forEach((token: any) => {
              const tokenName = token.tokenName;
              tokenUsageMap[tokenName] = (tokenUsageMap[tokenName] || 0) + (token.occurrences?.length || 1);
            });
          }
        });
      }
      
      // Convert to top tokens array
      const topTokens = Object.entries(tokenUsageMap)
        .map(([name, usage]) => ({
          name,
          usage: usage as number,
          category: 'canon-token'
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);
      
      return {
        scanDate: new Date(scanData.scanDate || Date.now()),
        totalRepositories: scanData.totalRepositories || 1,
        totalTokensFound: totalTokens,
        totalUniqueTokens: uniqueTokens,
        averageCoverage: Math.round((uniqueTokens / Math.max(totalTokens, 1)) * 100),
        topTokens,
        teamUsage,
        recentActivity: [
          {
            repository: 'canon-design-system',
            team: 'Design System',
            tokensFound: totalTokens,
            newTokens: 0,
            removedTokens: 0,
            scanDate: new Date(scanData.scanDate || Date.now())
          }
        ]
      };
      
    } catch (error) {
      console.error('Error reading latest scan results:', error);
      return this.getMockScanResults();
    }
  }

  /**
   * Get mock scan results as fallback
   */
  private getMockScanResults() {
    return {
      scanDate: new Date(),
      totalRepositories: 5,
      totalTokensFound: 1247,
      totalUniqueTokens: 247,
      averageCoverage: 78.5,
      topTokens: [
        { name: 'color-primary-500', usage: 156, category: 'color' },
        { name: 'spacing-md', usage: 143, category: 'spacing' },
        { name: 'font-size-lg', usage: 132, category: 'typography' },
        { name: 'border-radius-md', usage: 98, category: 'border' },
        { name: 'shadow-lg', usage: 87, category: 'shadow' }
      ],
      teamUsage: {
        'Marketing': 456,
        'E-commerce': 389,
        'Mobile': 245,
        'Email': 157
      },
      recentActivity: [
        {
          repository: 'marketing-website',
          team: 'Marketing',
          tokensFound: 89,
          newTokens: 3,
          removedTokens: 1,
          scanDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]
    };
  }

  /**
   * Get token usage details
   */
  async getTokenUsageDetails(tokenName: string) {
    // Mock implementation
    return {
      tokenName,
      totalUsage: 156,
      category: 'color',
      usageByTeam: {
        'Marketing': 67,
        'E-commerce': 45,
        'Mobile': 32,
        'Email': 12
      },
      usageByRepository: [
        { repository: 'marketing-website', team: 'Marketing', usage: 45, files: 12 },
        { repository: 'e-commerce-platform', team: 'E-commerce', usage: 34, files: 8 },
        { repository: 'mobile-app', team: 'Mobile', usage: 32, files: 15 }
      ],
      recentChanges: [
        {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          change: 'Added 12 new usages in marketing-website',
          type: 'increase'
        }
      ],
      files: [
        { path: 'src/components/Button.tsx', occurrences: 3 },
        { path: 'src/styles/colors.scss', occurrences: 2 },
        { path: 'src/pages/Home.tsx', occurrences: 1 }
      ]
    };
  }

    /**
   * Store scan results in database
   */
  private async storeScanResults(scanId: string, results: ScanResult[]) {
    try {
      await databaseService.saveScanResult(scanId, {
        scanId,
        timestamp: new Date(),
        results,
        summary: this.generateScanSummary(results)
      });
      console.log(`✅ Stored scan results for ${scanId}`);
    } catch (error) {
      console.error('❌ Error storing scan results:', error);
      // Continue execution even if storage fails
    }
  }

  /**
   * Generate scan summary
   */
  private generateScanSummary(results: ScanResult[]) {
    const totalTokens = results.reduce((sum, r) => sum + r.totalUsage, 0);
    const uniqueTokens = new Set(results.flatMap(r => r.tokensFound.map(t => t.tokenName))).size;
    const averageCoverage = results.reduce((sum, r) => sum + r.coverage, 0) / results.length;
    
    const teamUsage = results.reduce((acc, result) => {
      const team = result.repository.team;
      acc[team] = (acc[team] || 0) + result.totalUsage;
      return acc;
    }, {} as Record<string, number>);
    
    const topTokens = results
      .flatMap(r => r.tokensFound)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 10);
    
    return {
      totalRepositories: results.length,
      totalTokens,
      uniqueTokens,
      averageCoverage: Math.round(averageCoverage * 100) / 100,
      teamUsage,
      topTokens: topTokens.map(t => ({
        name: t.tokenName,
        usage: t.totalCount,
        category: t.category
      })),
      repositoriesByStatus: {
        successful: results.filter(r => r.errors.length === 0).length,
        withErrors: results.filter(r => r.errors.length > 0).length,
        failed: results.filter(r => r.tokensFound.length === 0 && r.errors.length > 0).length
      }
    };
  }

  /**
   * Extract repository name from URL
   */
  private extractRepoName(url: string): string {
    return url.split('/').pop()?.replace('.git', '') || 'unknown-repo';
  }

  /**
   * Schedule automated scans
   */
  async scheduleAutomatedScan(frequency: 'hourly' | 'daily' | 'weekly', teams?: string[]) {
    console.log(`⏰ Scheduling automated scan: ${frequency}`);
    
    // In a real implementation, this would integrate with a job scheduler
    // For now, just log the intent
    console.log(`🎯 Teams to scan: ${teams?.join(', ') || 'All teams'}`);
    
    return {
      scheduleId: `schedule-${Date.now()}`,
      frequency,
      teams: teams || ['all'],
      nextRun: new Date(Date.now() + (frequency === 'hourly' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)),
      status: 'active'
    };
  }

  /**
   * Get scan statistics for dashboard
   */
  async getScanStatistics() {
    return {
      totalScans: 45,
      lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextScheduledScan: new Date(Date.now() + 22 * 60 * 60 * 1000),
      averageScanTime: '2.3 minutes',
      successRate: 94.7,
      repositoriesTracked: 12,
      teamsActive: 4,
      trendsThisWeek: {
        scansCompleted: 7,
        newTokensFound: 12,
        tokensDeprecated: 3,
        coverageImprovement: '+2.1%'
      }
    };
  }

  /**
   * Get detailed scan data for pattern analysis
   */
  async getDetailedScanData() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const scanReportsDir = path.join(__dirname, '../../scan-reports');
      
      if (!fs.existsSync(scanReportsDir)) {
        return null;
      }
      
      const files = fs.readdirSync(scanReportsDir)
        .filter((file: string) => file.startsWith('token-scan-') && file.endsWith('.json'))
        .sort()
        .reverse(); // Get most recent first
      
      if (files.length === 0) {
        return null;
      }
      
      const latestFile = files[0];
      const filePath = path.join(scanReportsDir, latestFile);
      const scanData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      console.log(`📊 Using detailed scan data from: ${latestFile}`);
      
      // Transform to expected format for pattern analysis
      const tokenUsages: any[] = [];
      
      if (scanData.repositories && Array.isArray(scanData.repositories)) {
        scanData.repositories.forEach((repo: any) => {
          if (repo.tokensFound && Array.isArray(repo.tokensFound)) {
            repo.tokensFound.forEach((token: any) => {
              const occurrences = token.occurrences || [];
              tokenUsages.push({
                tokenName: token.tokenName,
                usages: occurrences.map((occurrence: any) => ({
                  filePath: occurrence.filePath,
                  lineNumber: occurrence.line,
                  context: occurrence.context
                }))
              });
            });
          }
        });
      }
      
      return {
        tokenUsages,
        scanDate: scanData.scanDate,
        totalRepositories: scanData.repositories?.length || 0
      };
      
    } catch (error) {
      console.error('Error getting detailed scan data:', error);
      return null;
    }
  }
}

// Singleton instance
export const scannerService = new ScannerService();
