import { TokenScanConfig, TokenFormat } from './TokenScanner';
/**
 * Canon Design System specific token formats
 * Based on actual Canon SCSS structure with $cds- prefix
 */
export declare const CANON_TOKEN_FORMATS: TokenFormat[];
/**
 * Canon Repositories Configuration
 * Currently configured for local Canon Design System repository
 */
export declare const CANON_REPOSITORIES: {
    url: string;
    name: string;
    team: string;
    type: "website";
    branch: string;
}[];
/**
 * Canon-specific file patterns
 * Prioritized for SCSS-based projects
 */
export declare const CANON_INCLUDE_PATTERNS: string[];
export declare const CANON_EXCLUDE_PATTERNS: string[];
/**
 * Canon Design System Configuration
 * This replaces the mock data with real repository scanning
 */
export declare const CANON_SCAN_CONFIG: TokenScanConfig;
/**
 * Team-specific configurations for Canon teams
 * Currently only Design System team is available with local repository
 */
export declare const CANON_TEAM_CONFIGS: {
    'design-system': {
        repositories: {
            url: string;
            name: string;
            team: string;
            type: "website";
            branch: string;
        }[];
        includePatterns: string[];
        tokenFormats: TokenFormat[];
        excludePatterns: string[];
        outputPath?: string;
    };
    marketing: {
        repositories: {
            url: string;
            name: string;
            team: string;
            type: "website";
            branch: string;
        }[];
        includePatterns: string[];
        tokenFormats: TokenFormat[];
        excludePatterns: string[];
        outputPath?: string;
    };
    ecommerce: {
        repositories: {
            url: string;
            name: string;
            team: string;
            type: "website";
            branch: string;
        }[];
        includePatterns: string[];
        tokenFormats: TokenFormat[];
        excludePatterns: string[];
        outputPath?: string;
    };
    mobile: {
        repositories: {
            url: string;
            name: string;
            team: string;
            type: "website";
            branch: string;
        }[];
        tokenFormats: TokenFormat[];
        includePatterns: string[];
        excludePatterns: string[];
        outputPath?: string;
    };
};
/**
 * Helper function to get Canon team configuration
 */
export declare function getCanonTeamConfig(team: string): TokenScanConfig;
/**
 * Environment-based configuration
 */
export declare function getCanonConfig(): TokenScanConfig;
//# sourceMappingURL=canon-config.d.ts.map