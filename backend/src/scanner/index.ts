/**
 * Token Scanner Module
 * 
 * This module provides comprehensive token usage scanning capabilities
 * for the Canon Design System usage tracker.
 * 
 * Features:
 * - Multi-repository scanning
 * - Multiple token format detection (CSS vars, SCSS, JS tokens, etc.)
 * - Pattern usage analysis  
 * - Team-specific scanning
 * - Automated scheduling
 * - Detailed reporting
 */

export { TokenScanner } from './TokenScanner';
export { ScannerService, scannerService } from './ScannerService';
export { 
  DEFAULT_SCAN_CONFIG, 
  DEFAULT_TOKEN_FORMATS,
  TEAM_CONFIGS,
  CANON_TOKEN_PATTERNS,
  createScanConfig,
  getTeamConfig 
} from './config';

export type {
  TokenScanConfig,
  RepositoryConfig,
  TokenFormat,
  ScanResult,
  TokenUsageResult,
  TokenOccurrence,
  PatternUsageResult,
  ScanSummary
} from './TokenScanner';

/**
 * Quick start example:
 * 
 * ```typescript
 * import { scannerService } from './scanner';
 * 
 * // Run full scan
 * const results = await scannerService.runFullScan();
 * 
 * // Run team-specific scan
 * const teamResults = await scannerService.runTeamScan('Marketing');
 * 
 * // Get latest results
 * const latest = await scannerService.getLatestScanResults();
 * ```
 */
