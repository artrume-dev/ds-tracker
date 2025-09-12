import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface GitChange {
  type: 'added' | 'modified' | 'deleted';
  file: string;
  diff?: string;
  tokenChanges?: TokenChange[];
}

export interface TokenChange {
  tokenName: string;
  oldValue?: string; // Optional - undefined for additions
  newValue?: string; // Optional - undefined for deletions
  lineNumber: number;
}

export interface CommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
  changes: GitChange[];
}

export class GitChangeDetector {
  private designSystemPath: string;
  private lastProcessedCommit: string | null = null;
  private lastScanFile: string;

  constructor(designSystemPath: string) {
    this.designSystemPath = designSystemPath;
    this.lastScanFile = path.join(__dirname, '../../../temp/last-scan-commit.txt');
    this.loadLastProcessedCommit();
  }

  private loadLastProcessedCommit(): void {
    try {
      if (fs.existsSync(this.lastScanFile)) {
        this.lastProcessedCommit = fs.readFileSync(this.lastScanFile, 'utf8').trim();
        console.log(`📋 Last processed commit: ${this.lastProcessedCommit}`);
      } else {
        console.log('📋 No previous scan found, will detect recent changes');
      }
    } catch (error) {
      console.error('Error loading last processed commit:', error);
    }
  }

  private saveLastProcessedCommit(commitHash: string): void {
    try {
      // Ensure temp directory exists
      const tempDir = path.dirname(this.lastScanFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(this.lastScanFile, commitHash);
      this.lastProcessedCommit = commitHash;
      console.log(`💾 Saved last processed commit: ${commitHash}`);
    } catch (error) {
      console.error('Error saving last processed commit:', error);
    }
  }

  public async getChangesSinceLastScan(): Promise<CommitInfo[]> {
    try {
      if (!fs.existsSync(this.designSystemPath)) {
        console.log(`⚠️  Design system path not found: ${this.designSystemPath}`);
        return [];
      }

      // Get the current latest commit
      const latestCommit = this.getLatestCommit();
      if (!latestCommit) {
        console.log('⚠️  No commits found in design system repository');
        return [];
      }

      // If no previous scan, get changes from last 24 hours
      let gitRange: string;
      if (!this.lastProcessedCommit) {
        gitRange = '--since="24 hours ago"';
        console.log('🔍 Getting changes from last 24 hours (first scan)');
      } else if (this.lastProcessedCommit === latestCommit) {
        console.log('✅ No new commits since last scan');
        return [];
      } else {
        gitRange = `${this.lastProcessedCommit}..${latestCommit}`;
        console.log(`🔍 Getting changes between ${this.lastProcessedCommit} and ${latestCommit}`);
      }

      const commits = this.getCommitsSinceLastScan(gitRange);
      
      // Update last processed commit
      if (commits.length > 0) {
        this.saveLastProcessedCommit(latestCommit);
      }

      return commits;
    } catch (error) {
      console.error('Error getting changes since last scan:', error);
      return [];
    }
  }

  private getLatestCommit(): string | null {
    try {
      const result = execSync('git rev-parse HEAD', { 
        cwd: this.designSystemPath,
        encoding: 'utf8' 
      });
      return result.trim();
    } catch (error) {
      console.error('Error getting latest commit:', error);
      return null;
    }
  }

  private getCommitsSinceLastScan(gitRange: string): CommitInfo[] {
    try {
      // Get commit list
      const commitListCmd = `git log ${gitRange} --pretty=format:"%H|%an|%ad|%s" --date=iso`;
      const commitList = execSync(commitListCmd, { 
        cwd: this.designSystemPath,
        encoding: 'utf8' 
      });

      if (!commitList.trim()) {
        return [];
      }

      const commits: CommitInfo[] = [];
      const commitLines = commitList.trim().split('\n');

      for (const line of commitLines) {
        const [hash, author, date, message] = line.split('|');
        
        // Get changes for this commit
        const changes = this.getChangesForCommit(hash);
        
        commits.push({
          hash: hash.substring(0, 8), // Short hash
          author,
          date,
          message,
          changes
        });
      }

      return commits;
    } catch (error) {
      console.error('Error getting commits:', error);
      return [];
    }
  }

  private getChangesForCommit(commitHash: string): GitChange[] {
    try {
      // Get list of changed files
      const changedFilesCmd = `git diff-tree --no-commit-id --name-status -r ${commitHash}`;
      const changedFiles = execSync(changedFilesCmd, { 
        cwd: this.designSystemPath,
        encoding: 'utf8' 
      });

      if (!changedFiles.trim()) {
        return [];
      }

      const changes: GitChange[] = [];
      const fileLines = changedFiles.trim().split('\n');

      for (const line of fileLines) {
        const [status, filePath] = line.split('\t');
        
        // Only process design token files
        if (!this.isTokenFile(filePath)) {
          continue;
        }

        const changeType = this.getChangeType(status);
        const change: GitChange = {
          type: changeType,
          file: filePath
        };

        // Get detailed diff for modified files
        if (changeType === 'modified') {
          change.diff = this.getFileDiff(commitHash, filePath);
          change.tokenChanges = this.parseTokenChanges(change.diff);
        }

        changes.push(change);
      }

      return changes;
    } catch (error) {
      console.error(`Error getting changes for commit ${commitHash}:`, error);
      return [];
    }
  }

  private isTokenFile(filePath: string): boolean {
    const tokenFilePatterns = [
      /tokens?\.(scss|css|json|js|ts)$/i,
      /_tokens?\.(scss|css|json|js|ts)$/i,
      /design-tokens?\.(scss|css|json|js|ts)$/i,
      /variables?\.(scss|css|json|js|ts)$/i,
      /_variables?\.(scss|css|json|js|ts)$/i,
      /theme\.(scss|css|json|js|ts)$/i,
      /foundation.*\.(scss|css)$/i,
      /colors?\.(scss|css|json|js|ts)$/i,
      /typography\.(scss|css|json|js|ts)$/i,
      /spacing\.(scss|css|json|js|ts)$/i,
      /size.*\.(scss|css|json|js|ts)$/i
    ];

    return tokenFilePatterns.some(pattern => pattern.test(filePath));
  }

  private getChangeType(status: string): 'added' | 'modified' | 'deleted' {
    switch (status) {
      case 'A': return 'added';
      case 'M': return 'modified';
      case 'D': return 'deleted';
      default: return 'modified';
    }
  }

  private getFileDiff(commitHash: string, filePath: string): string {
    try {
      const diffCmd = `git show ${commitHash} -- "${filePath}"`;
      const diff = execSync(diffCmd, { 
        cwd: this.designSystemPath,
        encoding: 'utf8' 
      });
      return diff;
    } catch (error) {
      console.error(`Error getting diff for ${filePath}:`, error);
      return '';
    }
  }

  private parseTokenChanges(diff: string): TokenChange[] {
    const tokenChanges: TokenChange[] = [];
    
    if (!diff) return tokenChanges;

    const lines = diff.split('\n');
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('@@')) {
        // Parse line number from diff header
        const match = line.match(/@@ -(\d+)/);
        if (match) {
          lineNumber = parseInt(match[1]);
        }
        continue;
      }

      // Handle removed tokens (deletions and modifications)
      if (line.startsWith('-') && !line.startsWith('---')) {
        const removedTokenMatch = this.extractTokenFromLine(line.substring(1));
        if (removedTokenMatch) {
          // Look for the corresponding + line (modification)
          let foundModification = false;
          for (let j = i + 1; j < lines.length && j < i + 5; j++) {
            const nextLine = lines[j];
            if (nextLine.startsWith('+') && !nextLine.startsWith('+++')) {
              const addedTokenMatch = this.extractTokenFromLine(nextLine.substring(1));
              if (addedTokenMatch && addedTokenMatch.name === removedTokenMatch.name) {
                tokenChanges.push({
                  tokenName: removedTokenMatch.name,
                  oldValue: removedTokenMatch.value,
                  newValue: addedTokenMatch.value,
                  lineNumber: lineNumber
                });
                foundModification = true;
                break;
              }
            }
          }
          
          // If no corresponding + line found, this is a pure deletion
          if (!foundModification) {
            tokenChanges.push({
              tokenName: removedTokenMatch.name,
              oldValue: removedTokenMatch.value,
              newValue: undefined, // Indicates deletion
              lineNumber: lineNumber
            });
          }
        }
      }
      
      // Handle added tokens (pure additions)
      else if (line.startsWith('+') && !line.startsWith('+++')) {
        const addedTokenMatch = this.extractTokenFromLine(line.substring(1));
        if (addedTokenMatch) {
          // Check if this addition is already handled as part of a modification
          const isPartOfModification = tokenChanges.some(change => 
            change.tokenName === addedTokenMatch.name && change.newValue !== null
          );
          
          if (!isPartOfModification) {
            tokenChanges.push({
              tokenName: addedTokenMatch.name,
              oldValue: undefined, // Indicates addition
              newValue: addedTokenMatch.value,
              lineNumber: lineNumber
            });
          }
        }
      }

      if (!line.startsWith('-')) {
        lineNumber++;
      }
    }

    return tokenChanges;
  }

  private extractTokenFromLine(line: string): { name: string; value: string } | null {
    // SCSS/CSS variable patterns
    const scssPattern = /\$([^:]+):\s*([^;]+);/;
    const cssPattern = /--([^:]+):\s*([^;]+);/;
    
    // JSON patterns
    const jsonPattern = /"([^"]+)":\s*"([^"]+)"/;
    
    // Try SCSS pattern
    let match = line.match(scssPattern);
    if (match) {
      return { name: `$${match[1].trim()}`, value: match[2].trim() };
    }

    // Try CSS custom property pattern
    match = line.match(cssPattern);
    if (match) {
      return { name: `--${match[1].trim()}`, value: match[2].trim() };
    }

    // Try JSON pattern
    match = line.match(jsonPattern);
    if (match) {
      return { name: match[1].trim(), value: match[2].trim() };
    }

    return null;
  }

  public async getRecentChanges(hours: number = 24): Promise<CommitInfo[]> {
    try {
      if (!fs.existsSync(this.designSystemPath)) {
        console.log(`⚠️  Design system path not found: ${this.designSystemPath}`);
        return [];
      }

      const gitRange = `--since="${hours} hours ago"`;
      console.log(`🔍 Getting changes from last ${hours} hours`);
      
      return this.getCommitsSinceLastScan(gitRange);
    } catch (error) {
      console.error('Error getting recent changes:', error);
      return [];
    }
  }
}
