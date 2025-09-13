"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamConfig = exports.createScanConfig = exports.CANON_TOKEN_PATTERNS = exports.TEAM_CONFIGS = exports.DEFAULT_TOKEN_FORMATS = exports.DEFAULT_SCAN_CONFIG = exports.scannerService = exports.ScannerService = exports.TokenScanner = void 0;
var TokenScanner_1 = require("./TokenScanner");
Object.defineProperty(exports, "TokenScanner", { enumerable: true, get: function () { return TokenScanner_1.TokenScanner; } });
var ScannerService_1 = require("./ScannerService");
Object.defineProperty(exports, "ScannerService", { enumerable: true, get: function () { return ScannerService_1.ScannerService; } });
Object.defineProperty(exports, "scannerService", { enumerable: true, get: function () { return ScannerService_1.scannerService; } });
var config_1 = require("./config");
Object.defineProperty(exports, "DEFAULT_SCAN_CONFIG", { enumerable: true, get: function () { return config_1.DEFAULT_SCAN_CONFIG; } });
Object.defineProperty(exports, "DEFAULT_TOKEN_FORMATS", { enumerable: true, get: function () { return config_1.DEFAULT_TOKEN_FORMATS; } });
Object.defineProperty(exports, "TEAM_CONFIGS", { enumerable: true, get: function () { return config_1.TEAM_CONFIGS; } });
Object.defineProperty(exports, "CANON_TOKEN_PATTERNS", { enumerable: true, get: function () { return config_1.CANON_TOKEN_PATTERNS; } });
Object.defineProperty(exports, "createScanConfig", { enumerable: true, get: function () { return config_1.createScanConfig; } });
Object.defineProperty(exports, "getTeamConfig", { enumerable: true, get: function () { return config_1.getTeamConfig; } });
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
//# sourceMappingURL=index.js.map