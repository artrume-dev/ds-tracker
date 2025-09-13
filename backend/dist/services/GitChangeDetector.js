"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitChangeDetector = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class GitChangeDetector {
    constructor(designSystemPath) {
        this.lastProcessedCommit = null;
        this.designSystemPath = designSystemPath;
        this.lastScanFile = path.join(__dirname, '../../../temp/last-scan-commit.txt');
        this.loadLastProcessedCommit();
    }
    loadLastProcessedCommit() {
        try {
            if (fs.existsSync(this.lastScanFile)) {
                this.lastProcessedCommit = fs.readFileSync(this.lastScanFile, 'utf8').trim();
                console.log(`📋 Last processed commit: ${this.lastProcessedCommit}`);
            }
            else {
                console.log('📋 No previous scan found, will detect recent changes');
            }
        }
        catch (error) {
            console.error('Error loading last processed commit:', error);
        }
    }
    saveLastProcessedCommit(commitHash) {
        try {
            // Ensure temp directory exists
            const tempDir = path.dirname(this.lastScanFile);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            fs.writeFileSync(this.lastScanFile, commitHash);
            this.lastProcessedCommit = commitHash;
            console.log(`💾 Saved last processed commit: ${commitHash}`);
        }
        catch (error) {
            console.error('Error saving last processed commit:', error);
        }
    }
    async getChangesSinceLastScan() {
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
            let gitRange;
            if (!this.lastProcessedCommit) {
                gitRange = '--since="24 hours ago"';
                console.log('🔍 Getting changes from last 24 hours (first scan)');
            }
            else if (this.lastProcessedCommit === latestCommit) {
                console.log('✅ No new commits since last scan');
                return [];
            }
            else {
                gitRange = `${this.lastProcessedCommit}..${latestCommit}`;
                console.log(`🔍 Getting changes between ${this.lastProcessedCommit} and ${latestCommit}`);
            }
            const commits = this.getCommitsSinceLastScan(gitRange);
            // Update last processed commit
            if (commits.length > 0) {
                this.saveLastProcessedCommit(latestCommit);
            }
            return commits;
        }
        catch (error) {
            console.error('Error getting changes since last scan:', error);
            return [];
        }
    }
    getLatestCommit() {
        try {
            const result = (0, child_process_1.execSync)('git rev-parse HEAD', {
                cwd: this.designSystemPath,
                encoding: 'utf8'
            });
            return result.trim();
        }
        catch (error) {
            console.error('Error getting latest commit:', error);
            return null;
        }
    }
    getCommitsSinceLastScan(gitRange) {
        try {
            // Get commit list
            const commitListCmd = `git log ${gitRange} --pretty=format:"%H|%an|%ad|%s" --date=iso`;
            const commitList = (0, child_process_1.execSync)(commitListCmd, {
                cwd: this.designSystemPath,
                encoding: 'utf8'
            });
            if (!commitList.trim()) {
                return [];
            }
            const commits = [];
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
        }
        catch (error) {
            console.error('Error getting commits:', error);
            return [];
        }
    }
    getChangesForCommit(commitHash) {
        try {
            // Get list of changed files
            const changedFilesCmd = `git diff-tree --no-commit-id --name-status -r ${commitHash}`;
            const changedFiles = (0, child_process_1.execSync)(changedFilesCmd, {
                cwd: this.designSystemPath,
                encoding: 'utf8'
            });
            if (!changedFiles.trim()) {
                return [];
            }
            const changes = [];
            const fileLines = changedFiles.trim().split('\n');
            for (const line of fileLines) {
                const [status, filePath] = line.split('\t');
                // Only process design token files
                if (!this.isTokenFile(filePath)) {
                    continue;
                }
                const changeType = this.getChangeType(status);
                const change = {
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
        }
        catch (error) {
            console.error(`Error getting changes for commit ${commitHash}:`, error);
            return [];
        }
    }
    isTokenFile(filePath) {
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
    getChangeType(status) {
        switch (status) {
            case 'A': return 'added';
            case 'M': return 'modified';
            case 'D': return 'deleted';
            default: return 'modified';
        }
    }
    getFileDiff(commitHash, filePath) {
        try {
            const diffCmd = `git show ${commitHash} -- "${filePath}"`;
            const diff = (0, child_process_1.execSync)(diffCmd, {
                cwd: this.designSystemPath,
                encoding: 'utf8'
            });
            return diff;
        }
        catch (error) {
            console.error(`Error getting diff for ${filePath}:`, error);
            return '';
        }
    }
    parseTokenChanges(diff) {
        const tokenChanges = [];
        if (!diff)
            return tokenChanges;
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
                    const isPartOfModification = tokenChanges.some(change => change.tokenName === addedTokenMatch.name && change.newValue !== null);
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
    extractTokenFromLine(line) {
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
    async getRecentChanges(hours = 24) {
        try {
            if (!fs.existsSync(this.designSystemPath)) {
                console.log(`⚠️  Design system path not found: ${this.designSystemPath}`);
                return [];
            }
            const gitRange = `--since="${hours} hours ago"`;
            console.log(`🔍 Getting changes from last ${hours} hours`);
            return this.getCommitsSinceLastScan(gitRange);
        }
        catch (error) {
            console.error('Error getting recent changes:', error);
            return [];
        }
    }
}
exports.GitChangeDetector = GitChangeDetector;
//# sourceMappingURL=GitChangeDetector.js.map