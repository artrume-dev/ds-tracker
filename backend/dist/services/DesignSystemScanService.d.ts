import { CommitInfo } from './GitChangeDetector';
import { TokenChange } from './NotificationService';
export declare class DesignSystemScanService {
    private gitChangeDetector;
    private designSystemPath;
    constructor();
    /**
     * Perform a comprehensive scan that includes git changes
     */
    performScan(): Promise<{
        success: boolean;
        scanId: string;
        gitChanges: CommitInfo[];
        tokenChanges: TokenChange[];
        message: string;
    }>;
    /**
     * Get recent changes without updating the last scan pointer
     */
    getRecentChanges(hours?: number): Promise<{
        commits: CommitInfo[];
        tokenChanges: TokenChange[];
    }>;
    /**
     * Convert git changes to token changes format
     */
    private convertGitChangesToTokenChanges;
    /**
     * Infer token category from file path for DesignSystemChange interface
     */
    private inferTokenCategoryDS;
    /**
     * Infer token category from file path
     */
    private inferTokenCategory;
    /**
     * Manually trigger a scan (for testing)
     */
    triggerManualScan(): Promise<any>;
}
export declare const designSystemScanService: DesignSystemScanService;
//# sourceMappingURL=DesignSystemScanService.d.ts.map