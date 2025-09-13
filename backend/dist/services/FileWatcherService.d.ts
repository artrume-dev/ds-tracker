export declare class FileWatcherService {
    private watchers;
    private isInitialized;
    private tokenPatterns;
    constructor();
    /**
     * Initialize file watching for Design System repository
     */
    initialize(): Promise<void>;
    /**
     * Watch a repository for file changes
     */
    private watchRepository;
    /**
     * Handle individual file changes
     */
    private handleFileChange;
    /**
     * Check if file is token-related
     */
    private isTokenFile;
    /**
     * Analyze file content for token changes
     */
    private analyzeTokenChanges;
    /**
     * Get line number for a given character index
     */
    private getLineNumber;
    /**
     * Notify all teams about Design System changes
     */
    private notifyDesignSystemChanges;
    /**
     * Extract component name from file path
     */
    private extractComponentFromPath;
    /**
     * Extract category from file path
     */
    private extractCategoryFromPath;
    /**
     * Get relative path within repository
     */
    private getRepositoryRelativePath;
    /**
     * Stop watching a repository
     */
    stopWatching(repoName: string): Promise<void>;
    /**
     * Stop all watchers
     */
    stopAll(): Promise<void>;
    /**
     * Get status of file watching
     */
    getStatus(): {
        isInitialized: boolean;
        watchedRepositories: string[];
    };
}
export declare const fileWatcherService: FileWatcherService;
//# sourceMappingURL=FileWatcherService.d.ts.map