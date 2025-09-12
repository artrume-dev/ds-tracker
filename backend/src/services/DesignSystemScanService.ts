import { GitChangeDetector, CommitInfo } from './GitChangeDetector';
import { notificationService, TokenChange } from './NotificationService';
import * as path from 'path';

export class DesignSystemScanService {
  private gitChangeDetector: GitChangeDetector;
  private designSystemPath: string;

  constructor() {
    this.designSystemPath = '/Users/samarmustafa/Documents/Samar/ssd-dev/canon-design-system-repo';
    this.gitChangeDetector = new GitChangeDetector(this.designSystemPath);
  }

  /**
   * Perform a comprehensive scan that includes git changes
   */
  async performScan(): Promise<{
    success: boolean;
    scanId: string;
    gitChanges: CommitInfo[];
    tokenChanges: TokenChange[];
    message: string;
  }> {
    const scanId = `scan-${Date.now()}`;
    
    try {
      console.log('🔍 Starting comprehensive Design System scan...');
      
      // 1. Get git changes since last scan
      console.log('📋 Checking for git changes since last scan...');
      const gitChanges = await this.gitChangeDetector.getChangesSinceLastScan();
      
      // 2. Convert git changes to token changes
      const tokenChanges = this.convertGitChangesToTokenChanges(gitChanges);
      
      // 3. Log the findings
      if (gitChanges.length > 0) {
        console.log(`✅ Found ${gitChanges.length} commit(s) with ${tokenChanges.length} token changes`);
        
        // Log each commit
        gitChanges.forEach(commit => {
          console.log(`📝 Commit ${commit.hash} by ${commit.author}: ${commit.message}`);
          commit.changes.forEach(change => {
            console.log(`   📄 ${change.type}: ${change.file}`);
            if (change.tokenChanges) {
              change.tokenChanges.forEach(tokenChange => {
                console.log(`      🎨 ${tokenChange.tokenName}: ${tokenChange.oldValue} → ${tokenChange.newValue}`);
              });
            }
          });
        });
      } else {
        console.log('✅ No new commits found since last scan');
      }
      
      // 4. Log what we found but DON'T send notifications here
      // Let ScannerService handle notifications with full context
      if (tokenChanges.length > 0) {
        console.log(`🔍 Found ${tokenChanges.length} token changes in Design System repository`);
        console.log(`📧 Will let ScannerService handle enhanced notifications with commit details`);
      } else if (gitChanges.length > 0) {
        console.log(`🔍 Found ${gitChanges.length} commit(s) with no token changes - sending commit details`);
        console.log(`📧 Will let ScannerService handle enhanced notifications with commit details`);
      } else {
        console.log('✅ No new commits found since last scan');
      }
      
      return {
        success: true,
        scanId,
        gitChanges,
        tokenChanges,
        message: gitChanges.length > 0 
          ? `Found ${gitChanges.length} commit(s) with ${tokenChanges.length} token changes`
          : 'Scan completed successfully - no new changes found'
      };
      
    } catch (error) {
      console.error('❌ Error during scan:', error);
      
      // Send error notification
      await notificationService.createNotification({
        type: 'system_alert',
        title: 'Scan Error',
        message: `Design System scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      
      return {
        success: false,
        scanId,
        gitChanges: [],
        tokenChanges: [],
        message: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get recent changes without updating the last scan pointer
   */
  async getRecentChanges(hours: number = 24): Promise<{
    commits: CommitInfo[];
    tokenChanges: TokenChange[];
  }> {
    try {
      console.log(`🔍 Getting recent changes from last ${hours} hours...`);
      
      const commits = await this.gitChangeDetector.getRecentChanges(hours);
      const tokenChanges = this.convertGitChangesToTokenChanges(commits);
      
      console.log(`✅ Found ${commits.length} recent commit(s) with ${tokenChanges.length} token changes`);
      
      return { commits, tokenChanges };
    } catch (error) {
      console.error('❌ Error getting recent changes:', error);
      return { commits: [], tokenChanges: [] };
    }
  }

  /**
   * Convert git changes to token changes format
   */
  private convertGitChangesToTokenChanges(gitChanges: CommitInfo[]): TokenChange[] {
    const tokenChanges: TokenChange[] = [];
    
    gitChanges.forEach(commit => {
      commit.changes.forEach(change => {
        if (change.tokenChanges) {
          change.tokenChanges.forEach(tokenChange => {
            tokenChanges.push({
              type: tokenChange.oldValue && tokenChange.newValue ? 'updated' : 
                    tokenChange.newValue ? 'added' : 'removed',
              tokenName: tokenChange.tokenName,
              category: this.inferTokenCategory(change.file),
              oldValue: tokenChange.oldValue,
              newValue: tokenChange.newValue,
              affectedFiles: [change.file],
              filePath: change.file,
              description: `${commit.message} (by ${commit.author})`
            });
          });
        } else if (change.type === 'added') {
          // File was added - infer it's a new token file
          tokenChanges.push({
            type: 'added',
            tokenName: path.basename(change.file, path.extname(change.file)),
            category: this.inferTokenCategory(change.file),
            newValue: 'New token file',
            affectedFiles: [change.file],
            filePath: change.file,
            description: `New token file added (by ${commit.author})`
          });
        }
      });
    });
    
    return tokenChanges;
  }

  /**
   * Infer token category from file path for DesignSystemChange interface
   */
  private inferTokenCategoryDS(filePath: string): 'raw' | 'foundation' | 'semantic' | 'component' {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('foundation')) return 'foundation';
    if (lowerPath.includes('component')) return 'component';
    if (lowerPath.includes('semantic')) return 'semantic';
    
    return 'raw';
  }

  /**
   * Infer token category from file path
   */
  private inferTokenCategory(filePath: string): string {
    const lowerPath = filePath.toLowerCase();
    
    if (lowerPath.includes('color')) return 'colors';
    if (lowerPath.includes('typography') || lowerPath.includes('font')) return 'typography';
    if (lowerPath.includes('spacing') || lowerPath.includes('space')) return 'spacing';
    if (lowerPath.includes('size') || lowerPath.includes('sizing')) return 'sizing';
    if (lowerPath.includes('breakpoint') || lowerPath.includes('media')) return 'breakpoints';
    if (lowerPath.includes('shadow') || lowerPath.includes('elevation')) return 'shadows';
    if (lowerPath.includes('border') || lowerPath.includes('radius')) return 'borders';
    if (lowerPath.includes('animation') || lowerPath.includes('transition')) return 'animation';
    if (lowerPath.includes('foundation')) return 'foundation';
    if (lowerPath.includes('component')) return 'component';
    
    return 'misc';
  }

  /**
   * Manually trigger a scan (for testing)
   */
  async triggerManualScan(): Promise<any> {
    console.log('🚀 Manual scan triggered...');
    return await this.performScan();
  }
}

export const designSystemScanService = new DesignSystemScanService();
