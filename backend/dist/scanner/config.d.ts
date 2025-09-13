import { TokenScanConfig, TokenFormat } from './TokenScanner';
/**
 * Default token formats for different implementation methods
 */
export declare const DEFAULT_TOKEN_FORMATS: TokenFormat[];
/**
 * Default scan configuration for Canon Design System
 */
export declare const DEFAULT_SCAN_CONFIG: TokenScanConfig;
/**
 * Team-specific configurations
 */
export declare const TEAM_CONFIGS: {
    marketing: {
        repositories: import("./TokenScanner").RepositoryConfig[];
        includePatterns: string[];
        tokenFormats: TokenFormat[];
        excludePatterns: string[];
        outputPath?: string;
    };
    ecommerce: {
        repositories: import("./TokenScanner").RepositoryConfig[];
        includePatterns: string[];
        tokenFormats: TokenFormat[];
        excludePatterns: string[];
        outputPath?: string;
    };
    mobile: {
        repositories: import("./TokenScanner").RepositoryConfig[];
        tokenFormats: TokenFormat[];
        includePatterns: string[];
        excludePatterns: string[];
        outputPath?: string;
    };
};
/**
 * Canon Design System specific token patterns
 */
export declare const CANON_TOKEN_PATTERNS: {
    colors: RegExp;
    spacing: RegExp;
    typography: RegExp;
    shadows: RegExp;
    borders: RegExp;
    animations: RegExp;
};
/**
 * Create custom scanner configuration
 */
export declare function createScanConfig(overrides: Partial<TokenScanConfig>): TokenScanConfig;
/**
 * Get configuration for specific team
 */
export declare function getTeamConfig(team: string): TokenScanConfig;
//# sourceMappingURL=config.d.ts.map