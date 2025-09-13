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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileWatcherService = exports.FileWatcherService = void 0;
const chokidar = __importStar(require("chokidar"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const NotificationService_1 = require("./NotificationService");
class FileWatcherService {
    constructor() {
        this.watchers = new Map();
        this.isInitialized = false;
        this.tokenPatterns = [
            // SCSS/CSS variables
            /\$([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g,
            // CSS custom properties
            /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g,
            // JSON tokens
            /"([a-zA-Z0-9-_.]+)"\s*:\s*"([^"]+)"/g,
            // JavaScript/TypeScript tokens
            /export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*['""]([^'"]+)['"]/g,
        ];
        console.log('🔍 FileWatcherService initialized');
    }
    /**
     * Initialize file watching for Design System repository
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ FileWatcherService already initialized');
            return;
        }
        try {
            // Watch the Design System repository
            const dsRepoPath = process.env.CANON_DS_REPO_PATH ||
                '/Users/samarmustafa/Documents/Projects/2025/VIBE-CODING/canon-design-system-repo';
            if (!fs_1.default.existsSync(dsRepoPath)) {
                console.log(`⚠️ Design System repository not found at: ${dsRepoPath}`);
                return;
            }
            await this.watchRepository('canon-design-system', dsRepoPath);
            this.isInitialized = true;
            console.log('✅ FileWatcherService initialized and watching Design System repository');
        }
        catch (error) {
            console.error('❌ Failed to initialize FileWatcherService:', error);
            throw error;
        }
    }
    /**
     * Watch a repository for file changes
     */
    async watchRepository(repoName, repoPath) {
        console.log(`🔍 Starting to watch repository: ${repoName} at ${repoPath}`);
        // Patterns to watch for token files
        const watchPatterns = [
            path_1.default.join(repoPath, '**/*.scss'),
            path_1.default.join(repoPath, '**/*.css'),
            path_1.default.join(repoPath, '**/*.json'),
            path_1.default.join(repoPath, '**/*.js'),
            path_1.default.join(repoPath, '**/*.ts'),
            path_1.default.join(repoPath, '**/*tokens*'),
            path_1.default.join(repoPath, '**/*foundation*'),
            path_1.default.join(repoPath, '**/*components*'),
            path_1.default.join(repoPath, '**/*patterns*'),
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
            .on('change', (filePath) => {
            console.log(`🔍 File changed detected: ${filePath}`);
            this.handleFileChange(repoName, filePath, 'modified');
        })
            .on('add', (filePath) => {
            console.log(`🔍 File added detected: ${filePath}`);
            this.handleFileChange(repoName, filePath, 'added');
        })
            .on('unlink', (filePath) => {
            console.log(`🔍 File removed detected: ${filePath}`);
            this.handleFileChange(repoName, filePath, 'deleted');
        })
            .on('error', (err) => {
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
    async handleFileChange(repository, filePath, changeType) {
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
        }
        catch (error) {
            console.error(`❌ Error handling file change for ${filePath}:`, error);
        }
    }
    /**
     * Check if file is token-related
     */
    isTokenFile(filePath) {
        const fileName = path_1.default.basename(filePath).toLowerCase();
        const dirPath = path_1.default.dirname(filePath).toLowerCase();
        console.log(`🔍 Checking if token file: ${filePath}`);
        console.log(`📝 File name: ${fileName}, Dir path: ${dirPath}`);
        // Check for token-related patterns
        const tokenIndicators = [
            'token', 'foundation', 'variable', 'theme', 'color', 'spacing', 'typography', 'size'
        ];
        const isTokenFile = tokenIndicators.some(indicator => fileName.includes(indicator) || dirPath.includes(indicator));
        console.log(`🎯 Is token file: ${isTokenFile} (indicators: ${tokenIndicators.join(', ')})`);
        return isTokenFile;
    }
    /**
     * Analyze file content for token changes
     */
    async analyzeTokenChanges(filePath, changeType) {
        try {
            if (changeType === 'deleted') {
                return [{
                        token: path_1.default.basename(filePath),
                        type: 'deleted',
                        filePath,
                    }];
            }
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            const changes = [];
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
        }
        catch (error) {
            console.error(`❌ Error analyzing token changes in ${filePath}:`, error);
            return [];
        }
    }
    /**
     * Get line number for a given character index
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }
    /**
     * Notify all teams about Design System changes
     */
    async notifyDesignSystemChanges(repository, filePath, tokenChanges) {
        try {
            const changes = tokenChanges.map(change => ({
                type: 'token',
                action: change.type === 'deleted' ? 'removed' : change.type,
                name: change.token,
                oldValue: change.oldValue,
                newValue: change.newValue,
                filePath: filePath,
                category: this.extractCategoryFromPath(filePath),
                description: `Token ${change.type} in ${this.extractComponentFromPath(filePath)}`,
            }));
            // Generate unique change ID
            const changeId = `change-${Date.now()}`;
            const relativePath = this.getRepositoryRelativePath(filePath);
            // Use the enhanced notification service
            const notificationChanges = changes.map(change => ({
                type: change.action,
                tokenName: change.name,
                category: change.category,
                oldValue: change.oldValue,
                newValue: change.newValue,
                filePath: change.filePath,
                description: change.description
            }));
            await NotificationService_1.notificationService.notifyDesignSystemChanges(changeId, notificationChanges);
            console.log(`✅ Notified all teams about ${tokenChanges.length} token changes in ${filePath}`);
        }
        catch (error) {
            console.error(`❌ Error notifying teams about changes:`, error);
        }
    }
    /**
     * Extract component name from file path
     */
    extractComponentFromPath(filePath) {
        const pathParts = filePath.split(path_1.default.sep);
        // Look for component indicators
        const componentIndicators = ['components', 'patterns', 'foundation'];
        for (let i = 0; i < pathParts.length; i++) {
            if (componentIndicators.includes(pathParts[i].toLowerCase()) && i + 1 < pathParts.length) {
                return pathParts[i + 1];
            }
        }
        // Fallback to directory name
        return path_1.default.basename(path_1.default.dirname(filePath));
    }
    /**
     * Extract category from file path
     */
    extractCategoryFromPath(filePath) {
        const pathLower = filePath.toLowerCase();
        if (pathLower.includes('foundation') || pathLower.includes('base')) {
            return 'foundation';
        }
        else if (pathLower.includes('semantic') || pathLower.includes('theme')) {
            return 'semantic';
        }
        else if (pathLower.includes('component')) {
            return 'component';
        }
        else {
            return 'raw';
        }
    }
    /**
     * Get relative path within repository
     */
    getRepositoryRelativePath(filePath) {
        const dsRepoPath = process.env.CANON_DS_REPO_PATH ||
            '/Users/samarmustafa/Documents/Projects/2025/VIBE-CODING/canon-design-system-repo';
        return path_1.default.relative(dsRepoPath, filePath);
    }
    /**
     * Stop watching a repository
     */
    async stopWatching(repoName) {
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
    async stopAll() {
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
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            watchedRepositories: Array.from(this.watchers.keys()),
        };
    }
}
exports.FileWatcherService = FileWatcherService;
// Export singleton instance
exports.fileWatcherService = new FileWatcherService();
//# sourceMappingURL=FileWatcherService.js.map