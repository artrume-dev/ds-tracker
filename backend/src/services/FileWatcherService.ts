import * as chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { notificationService } from './NotificationService';

interface FileChange {
  filePath: string;
  type: 'added' | 'modified' | 'deleted';
  timestamp: Date;
  repository: string;
}

interface TokenChange {
  token: string;
  type: 'added' | 'modified' | 'deleted';
  oldValue?: string;
  newValue?: string;
  filePath: string;
  lineNumber?: number;
}

export class FileWatcherService {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private isInitialized = false;
  private tokenPatterns = [
    // SCSS/CSS variables
    /\$([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g,
    // CSS custom properties
    /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g,
    // JSON tokens
    /"([a-zA-Z0-9-_.]+)"\s*:\s*"([^"]+)"/g,
    // JavaScript/TypeScript tokens
    /export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*['""]([^'"]+)['"]/g,
  ];

  constructor() {
    console.log('🔍 FileWatcherService initialized');
  }

  /**
   * Initialize file watching for Design System repository
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ FileWatcherService already initialized');
      return;
    }

    try {
      // Watch the Design System repository
      const dsRepoPath = process.env.CANON_DS_REPO_PATH || 
                        '/Users/samarmustafa/Documents/Projects/2025/VIBE-CODING/canon-design-system-repo';
      
      if (!fs.existsSync(dsRepoPath)) {
        console.log(`⚠️ Design System repository not found at: ${dsRepoPath}`);
        return;
      }

      await this.watchRepository('canon-design-system', dsRepoPath);
      this.isInitialized = true;
      console.log('✅ FileWatcherService initialized and watching Design System repository');
    } catch (error) {
      console.error('❌ Failed to initialize FileWatcherService:', error);
      throw error;
    }
  }

  /**
   * Watch a repository for file changes
   */
  private async watchRepository(repoName: string, repoPath: string): Promise<void> {
    console.log(`🔍 Starting to watch repository: ${repoName} at ${repoPath}`);

    // Patterns to watch for token files
    const watchPatterns = [
      path.join(repoPath, '**/*.scss'),
      path.join(repoPath, '**/*.css'),
      path.join(repoPath, '**/*.json'),
      path.join(repoPath, '**/*.js'),
      path.join(repoPath, '**/*.ts'),
      path.join(repoPath, '**/*tokens*'),
      path.join(repoPath, '**/*foundation*'),
      path.join(repoPath, '**/*components*'),
      path.join(repoPath, '**/*patterns*'),
    ];

    const watcher = chokidar.watch(watchPatterns, {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/*.log',
        '**/.DS_Store',
      ],
      persistent: true,
      ignoreInitial: true, // Don't trigger events for existing files
      followSymlinks: false,
      depth: 10,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      },
      usePolling: false,
      interval: 100,
      binaryInterval: 300
    });

    // Handle file changes
    watcher
      .on('change', (filePath: string) => {
        console.log(`🔍 File changed detected: ${filePath}`);
        this.handleFileChange(repoName, filePath, 'modified');
      })
      .on('add', (filePath: string) => {
        console.log(`🔍 File added detected: ${filePath}`);
        this.handleFileChange(repoName, filePath, 'added');
      })
      .on('unlink', (filePath: string) => {
        console.log(`🔍 File removed detected: ${filePath}`);
        this.handleFileChange(repoName, filePath, 'deleted');
      })
      .on('error', (err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`❌ File watcher error for ${repoName}:`, error);
      })
      .on('ready', () => {
        console.log(`✅ File watcher ready for ${repoName}`);
        console.log(`📁 Watching patterns:`, watchPatterns);
      });

    this.watchers.set(repoName, watcher);
  }

  /**
   * Handle individual file changes
   */
  private async handleFileChange(repository: string, filePath: string, changeType: 'added' | 'modified' | 'deleted'): Promise<void> {
    try {
      console.log(`📄 File ${changeType}: ${filePath}`);

      // Check if this is a token-related file
      if (!this.isTokenFile(filePath)) {
        return;
      }

      console.log(`🎯 Token file detected: ${filePath}`);

      // Analyze the file for token changes
      const tokenChanges = await this.analyzeTokenChanges(filePath, changeType);
      
      if (tokenChanges.length > 0) {
        console.log(`📊 Found ${tokenChanges.length} token changes in ${filePath}`);
        
        // Notify all teams about Design System changes
        await this.notifyDesignSystemChanges(repository, filePath, tokenChanges);
      }

    } catch (error) {
      console.error(`❌ Error handling file change for ${filePath}:`, error);
    }
  }

  /**
   * Check if file is token-related
   */
  private isTokenFile(filePath: string): boolean {
    const fileName = path.basename(filePath).toLowerCase();
    const dirPath = path.dirname(filePath).toLowerCase();
    
    console.log(`🔍 Checking if token file: ${filePath}`);
    console.log(`📝 File name: ${fileName}, Dir path: ${dirPath}`);
    
    // Check for token-related patterns
    const tokenIndicators = [
      'token', 'foundation', 'variable', 'theme', 'color', 'spacing', 'typography', 'size'
    ];
    
    const isTokenFile = tokenIndicators.some(indicator => 
      fileName.includes(indicator) || dirPath.includes(indicator)
    );
    
    console.log(`🎯 Is token file: ${isTokenFile} (indicators: ${tokenIndicators.join(', ')})`);
    return isTokenFile;
  }

  /**
   * Analyze file content for token changes
   */
  private async analyzeTokenChanges(filePath: string, changeType: 'added' | 'modified' | 'deleted'): Promise<TokenChange[]> {
    try {
      if (changeType === 'deleted') {
        return [{
          token: path.basename(filePath),
          type: 'deleted',
          filePath,
        }];
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const changes: TokenChange[] = [];

      // Extract tokens using different patterns
      for (const pattern of this.tokenPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const tokenName = match[1];
          const tokenValue = match[2];
          
          changes.push({
            token: tokenName,
            type: changeType,
            newValue: tokenValue,
            filePath,
            lineNumber: this.getLineNumber(content, match.index),
          });
        }
      }

      return changes;
    } catch (error) {
      console.error(`❌ Error analyzing token changes in ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Get line number for a given character index
   */
  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Notify all teams about Design System changes
   */
  private async notifyDesignSystemChanges(repository: string, filePath: string, tokenChanges: TokenChange[]): Promise<void> {
    try {
      const changes = tokenChanges.map(change => ({
        type: 'token' as const,
        action: change.type === 'deleted' ? 'removed' as const : change.type as 'added' | 'modified',
        name: change.token,
        oldValue: change.oldValue,
        newValue: change.newValue,
        filePath: filePath,
        category: this.extractCategoryFromPath(filePath) as 'raw' | 'foundation' | 'semantic' | 'component',
        description: `Token ${change.type} in ${this.extractComponentFromPath(filePath)}`,
      }));

      // Generate unique change ID
      const changeId = `change-${Date.now()}`;
      const relativePath = this.getRepositoryRelativePath(filePath);

      // Use the enhanced notification service
      const notificationChanges = changes.map(change => ({
        type: change.action as 'added' | 'updated' | 'removed',
        tokenName: change.name,
        category: change.category,
        oldValue: change.oldValue,
        newValue: change.newValue,
        filePath: change.filePath,
        description: change.description
      }));
      await notificationService.notifyDesignSystemChanges(changeId, notificationChanges);

      console.log(`✅ Notified all teams about ${tokenChanges.length} token changes in ${filePath}`);
    } catch (error) {
      console.error(`❌ Error notifying teams about changes:`, error);
    }
  }

  /**
   * Extract component name from file path
   */
  private extractComponentFromPath(filePath: string): string {
    const pathParts = filePath.split(path.sep);
    
    // Look for component indicators
    const componentIndicators = ['components', 'patterns', 'foundation'];
    for (let i = 0; i < pathParts.length; i++) {
      if (componentIndicators.includes(pathParts[i].toLowerCase()) && i + 1 < pathParts.length) {
        return pathParts[i + 1];
      }
    }
    
    // Fallback to directory name
    return path.basename(path.dirname(filePath));
  }

  /**
   * Extract category from file path
   */
  private extractCategoryFromPath(filePath: string): 'raw' | 'foundation' | 'semantic' | 'component' {
    const pathLower = filePath.toLowerCase();
    
    if (pathLower.includes('foundation') || pathLower.includes('base')) {
      return 'foundation';
    } else if (pathLower.includes('semantic') || pathLower.includes('theme')) {
      return 'semantic';
    } else if (pathLower.includes('component')) {
      return 'component';
    } else {
      return 'raw';
    }
  }

  /**
   * Get relative path within repository
   */
  private getRepositoryRelativePath(filePath: string): string {
    const dsRepoPath = process.env.CANON_DS_REPO_PATH || 
                      '/Users/samarmustafa/Documents/Projects/2025/VIBE-CODING/canon-design-system-repo';
    return path.relative(dsRepoPath, filePath);
  }

  /**
   * Stop watching a repository
   */
  async stopWatching(repoName: string): Promise<void> {
    const watcher = this.watchers.get(repoName);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(repoName);
      console.log(`🛑 Stopped watching repository: ${repoName}`);
    }
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    console.log('🛑 Stopping all file watchers...');
    for (const [repoName, watcher] of this.watchers) {
      await watcher.close();
      console.log(`🛑 Stopped watching: ${repoName}`);
    }
    this.watchers.clear();
    this.isInitialized = false;
    console.log('✅ All file watchers stopped');
  }

  /**
   * Get status of file watching
   */
  getStatus(): { isInitialized: boolean; watchedRepositories: string[] } {
    return {
      isInitialized: this.isInitialized,
      watchedRepositories: Array.from(this.watchers.keys()),
    };
  }
}

// Export singleton instance
export const fileWatcherService = new FileWatcherService();
