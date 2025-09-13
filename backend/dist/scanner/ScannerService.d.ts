import { ScanResult } from './TokenScanner';
export declare class ScannerService {
    private scanner;
    constructor();
    /**
     * Run scan for all configured repositories
     */
    runFullScan(): Promise<{
        scanId: string;
        results: ScanResult[];
        summary: any;
    }>;
    /**
     * Run scan for specific team
     */
    runTeamScan(teamName: string): Promise<ScanResult[]>;
    /**
     * Run scan for specific repository
     */
    runRepositoryScan(repoUrl: string, teamName: string): Promise<ScanResult>;
    /**
     * Get scan history
     */
    getScanHistory(limit?: number): Promise<{
        id: string;
        date: Date;
        type: string;
        repositories: number;
        tokensFound: number;
        status: string;
    }[]>;
    /**
     * Get latest scan results
     */
    getLatestScanResults(): Promise<{
        scanDate: Date;
        totalRepositories: any;
        totalTokensFound: any;
        totalUniqueTokens: any;
        averageCoverage: number;
        topTokens: {
            name: string;
            usage: number;
            category: string;
        }[];
        teamUsage: any;
        recentActivity: {
            repository: string;
            team: string;
            tokensFound: any;
            newTokens: number;
            removedTokens: number;
            scanDate: Date;
        }[];
    }>;
    /**
     * Get mock scan results as fallback
     */
    private getMockScanResults;
    /**
     * Get token usage details
     */
    getTokenUsageDetails(tokenName: string): Promise<{
        tokenName: string;
        totalUsage: number;
        category: string;
        usageByTeam: {
            Marketing: number;
            'E-commerce': number;
            Mobile: number;
            Email: number;
        };
        usageByRepository: {
            repository: string;
            team: string;
            usage: number;
            files: number;
        }[];
        recentChanges: {
            date: Date;
            change: string;
            type: string;
        }[];
        files: {
            path: string;
            occurrences: number;
        }[];
    }>;
    /**
   * Store scan results in database
   */
    private storeScanResults;
    /**
     * Generate scan summary
     */
    private generateScanSummary;
    /**
     * Extract repository name from URL
     */
    private extractRepoName;
    /**
     * Schedule automated scans
     */
    scheduleAutomatedScan(frequency: 'hourly' | 'daily' | 'weekly', teams?: string[]): Promise<{
        scheduleId: string;
        frequency: "hourly" | "daily" | "weekly";
        teams: string[];
        nextRun: Date;
        status: string;
    }>;
    /**
     * Get scan statistics for dashboard
     */
    getScanStatistics(): Promise<{
        totalScans: number;
        lastScan: Date;
        nextScheduledScan: Date;
        averageScanTime: string;
        successRate: number;
        repositoriesTracked: number;
        teamsActive: number;
        trendsThisWeek: {
            scansCompleted: number;
            newTokensFound: number;
            tokensDeprecated: number;
            coverageImprovement: string;
        };
    }>;
    /**
     * Get detailed scan data for pattern analysis
     */
    getDetailedScanData(): Promise<{
        tokenUsages: any[];
        scanDate: any;
        totalRepositories: any;
    } | null>;
}
export declare const scannerService: ScannerService;
//# sourceMappingURL=ScannerService.d.ts.map