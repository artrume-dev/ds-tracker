export interface GitChange {
    type: 'added' | 'modified' | 'deleted';
    file: string;
    diff?: string;
    tokenChanges?: TokenChange[];
}
export interface TokenChange {
    tokenName: string;
    oldValue?: string;
    newValue?: string;
    lineNumber: number;
}
export interface CommitInfo {
    hash: string;
    author: string;
    date: string;
    message: string;
    changes: GitChange[];
}
export declare class GitChangeDetector {
    private designSystemPath;
    private lastProcessedCommit;
    private lastScanFile;
    constructor(designSystemPath: string);
    private loadLastProcessedCommit;
    private saveLastProcessedCommit;
    getChangesSinceLastScan(): Promise<CommitInfo[]>;
    private getLatestCommit;
    private getCommitsSinceLastScan;
    private getChangesForCommit;
    private isTokenFile;
    private getChangeType;
    private getFileDiff;
    private parseTokenChanges;
    private extractTokenFromLine;
    getRecentChanges(hours?: number): Promise<CommitInfo[]>;
}
//# sourceMappingURL=GitChangeDetector.d.ts.map