export interface TokenScanConfig {
    repositories: RepositoryConfig[];
    tokenFormats: TokenFormat[];
    includePatterns: string[];
    excludePatterns: string[];
    outputPath?: string;
}
export interface RepositoryConfig {
    url: string;
    name: string;
    branch?: string;
    team: string;
    type: 'website' | 'mobile-app' | 'desktop-app' | 'email' | 'social';
    localPath?: string;
}
export interface TokenFormat {
    name: string;
    pattern: RegExp;
    fileExtensions: string[];
    description: string;
}
export interface ScanResult {
    repository: RepositoryConfig;
    scanDate: Date;
    tokensFound: TokenUsageResult[];
    totalUsage: number;
    coverage: number;
    patterns: PatternUsageResult[];
    errors: string[];
    summary: ScanSummary;
}
export interface TokenUsageResult {
    tokenName: string;
    tokenType: string;
    occurrences: TokenOccurrence[];
    totalCount: number;
    files: string[];
    category?: 'color' | 'typography' | 'spacing' | 'shadow' | 'border' | 'animation' | 'breakpoint';
}
export interface TokenOccurrence {
    filePath: string;
    line: number;
    column: number;
    context: string;
    matchedText: string;
    formatType: string;
}
export interface PatternUsageResult {
    patternName: string;
    tokenDependencies: string[];
    usageCount: number;
    locations: string[];
    complexity: 'simple' | 'medium' | 'complex';
}
export interface ScanSummary {
    totalFiles: number;
    scannedFiles: number;
    tokensFound: number;
    uniqueTokens: number;
    mostUsedToken: string;
    coveragePercentage: number;
}
export declare class TokenScanner {
    private config;
    private git;
    constructor(config: TokenScanConfig);
    /**
     * Main scan method - scans all configured repositories
     */
    scanAllRepositories(): Promise<ScanResult[]>;
    /**
     * Scan a single repository for token usage
     */
    scanRepository(repo: RepositoryConfig): Promise<ScanResult>;
    /**
     * Clone or update repository locally
     */
    private prepareRepository;
    /**
     * Get list of files to scan based on patterns
     */
    private getFilesToScan;
    /**
     * Scan a single file for token usage
     */
    private scanFile;
    /**
     * Find token matches in file content
     */
    private findTokenMatches;
    /**
     * Extract clean token name from matched text
     */
    private extractTokenName;
    /**
     * Categorize token based on name patterns
     */
    private categorizeToken;
    /**
     * Get context around a match
     */
    private getContextAround;
    /**
     * Scan for design pattern usage
     */
    private scanForPatterns;
    /**
     * Aggregate token usages across files
     */
    private aggregateTokenUsages;
    /**
     * Aggregate pattern usages
     */
    private aggregatePatterns;
    /**
     * Calculate coverage percentage
     */
    private calculateCoverage;
    /**
     * Generate comprehensive scan report
     */
    private generateScanReport;
    /**
     * Generate overall summary across all repositories
     */
    private generateOverallSummary;
}
//# sourceMappingURL=TokenScanner.d.ts.map