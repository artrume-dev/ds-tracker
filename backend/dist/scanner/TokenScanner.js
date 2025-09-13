"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenScanner = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const simple_git_1 = __importDefault(require("simple-git"));
class TokenScanner {
    constructor(config) {
        this.git = (0, simple_git_1.default)();
        this.config = config;
    }
    /**
     * Main scan method - scans all configured repositories
     */
    async scanAllRepositories() {
        console.log('🔍 Starting token usage scan...');
        const results = [];
        for (const repo of this.config.repositories) {
            try {
                console.log(`📂 Scanning repository: ${repo.name}`);
                const result = await this.scanRepository(repo);
                results.push(result);
                console.log(`✅ Completed scan for ${repo.name}: ${result.tokensFound.length} tokens found`);
            }
            catch (error) {
                console.error(`❌ Failed to scan ${repo.name}:`, error);
                results.push({
                    repository: repo,
                    scanDate: new Date(),
                    tokensFound: [],
                    totalUsage: 0,
                    coverage: 0,
                    patterns: [],
                    errors: [error instanceof Error ? error.message : 'Unknown error'],
                    summary: {
                        totalFiles: 0,
                        scannedFiles: 0,
                        tokensFound: 0,
                        uniqueTokens: 0,
                        mostUsedToken: '',
                        coveragePercentage: 0
                    }
                });
            }
        }
        await this.generateScanReport(results);
        return results;
    }
    /**
     * Scan a single repository for token usage
     */
    async scanRepository(repo) {
        const scanStartTime = Date.now();
        // Clone or update repository
        const localPath = await this.prepareRepository(repo);
        // Get all files to scan
        const filesToScan = await this.getFilesToScan(localPath);
        // Scan each file for tokens
        const allTokenUsages = [];
        const allPatterns = [];
        const errors = [];
        for (const filePath of filesToScan) {
            try {
                const fileTokens = await this.scanFile(filePath, localPath);
                allTokenUsages.push(...fileTokens);
                const filePatterns = await this.scanForPatterns(filePath, localPath);
                allPatterns.push(...filePatterns);
            }
            catch (error) {
                errors.push(`Error scanning ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        // Aggregate results
        const aggregatedTokens = this.aggregateTokenUsages(allTokenUsages);
        const aggregatedPatterns = this.aggregatePatterns(allPatterns);
        const totalUsage = aggregatedTokens.reduce((sum, token) => sum + token.totalCount, 0);
        const summary = {
            totalFiles: filesToScan.length,
            scannedFiles: filesToScan.length - errors.length,
            tokensFound: totalUsage,
            uniqueTokens: aggregatedTokens.length,
            mostUsedToken: aggregatedTokens.length > 0 ? aggregatedTokens[0].tokenName : '',
            coveragePercentage: this.calculateCoverage(aggregatedTokens)
        };
        console.log(`⏱️  Scan completed in ${Date.now() - scanStartTime}ms`);
        return {
            repository: repo,
            scanDate: new Date(),
            tokensFound: aggregatedTokens,
            totalUsage,
            coverage: summary.coveragePercentage,
            patterns: aggregatedPatterns,
            errors,
            summary
        };
    }
    /**
     * Clone or update repository locally
     */
    async prepareRepository(repo) {
        // Check if it's a local path
        if (repo.url.startsWith('/') || repo.url.startsWith('./') || repo.url.startsWith('../')) {
            console.log(`📂 Using local repository: ${repo.name} at ${repo.url}`);
            // Verify local path exists
            try {
                await promises_1.default.access(repo.url);
                return repo.url;
            }
            catch (error) {
                throw new Error(`Local repository path does not exist: ${repo.url}`);
            }
        }
        // Handle remote Git repositories
        const localPath = repo.localPath || path_1.default.join(process.cwd(), 'temp', 'repos', repo.name);
        try {
            // Check if repo exists locally
            await promises_1.default.access(localPath);
            console.log(`📥 Updating existing repository: ${repo.name}`);
            // Update existing repo
            const git = (0, simple_git_1.default)(localPath);
            await git.fetch();
            await git.checkout(repo.branch || 'main');
            await git.pull();
        }
        catch (error) {
            console.log(`📥 Cloning repository: ${repo.name}`);
            // Create directory structure
            await promises_1.default.mkdir(path_1.default.dirname(localPath), { recursive: true });
            // Clone repository
            await this.git.clone(repo.url, localPath);
            // Checkout specific branch if specified
            if (repo.branch && repo.branch !== 'main') {
                const git = (0, simple_git_1.default)(localPath);
                await git.checkout(repo.branch);
            }
        }
        return localPath;
    }
    /**
     * Get list of files to scan based on patterns
     */
    async getFilesToScan(localPath) {
        const allFiles = [];
        // Use include patterns to find files
        for (const pattern of this.config.includePatterns) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: localPath,
                absolute: true,
                ignore: this.config.excludePatterns
            });
            allFiles.push(...files);
        }
        // Remove duplicates and filter by supported extensions
        const supportedExtensions = new Set(this.config.tokenFormats.flatMap(format => format.fileExtensions));
        const uniqueFiles = [...new Set(allFiles)]
            .filter(file => {
            const ext = path_1.default.extname(file).slice(1);
            return supportedExtensions.has(ext);
        });
        console.log(`📄 Found ${uniqueFiles.length} files to scan`);
        return uniqueFiles;
    }
    /**
     * Scan a single file for token usage
     */
    async scanFile(filePath, repoPath) {
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        const relativePath = path_1.default.relative(repoPath, filePath);
        const fileExtension = path_1.default.extname(filePath).slice(1);
        const tokenUsages = [];
        // Apply each token format pattern
        for (const format of this.config.tokenFormats) {
            if (!format.fileExtensions.includes(fileExtension))
                continue;
            const matches = this.findTokenMatches(content, format, relativePath);
            if (matches.length > 0) {
                // Group matches by token name
                const tokenGroups = new Map();
                matches.forEach(match => {
                    const tokenName = this.extractTokenName(match.matchedText, format);
                    if (!tokenGroups.has(tokenName)) {
                        tokenGroups.set(tokenName, []);
                    }
                    tokenGroups.get(tokenName).push(match);
                });
                // Create TokenUsageResult for each unique token
                tokenGroups.forEach((occurrences, tokenName) => {
                    tokenUsages.push({
                        tokenName,
                        tokenType: format.name,
                        occurrences,
                        totalCount: occurrences.length,
                        files: [relativePath],
                        category: this.categorizeToken(tokenName)
                    });
                });
            }
        }
        return tokenUsages;
    }
    /**
     * Find token matches in file content
     */
    findTokenMatches(content, format, filePath) {
        const matches = [];
        const lines = content.split('\n');
        lines.forEach((line, lineIndex) => {
            let match;
            const regex = new RegExp(format.pattern.source, format.pattern.flags);
            while ((match = regex.exec(line)) !== null) {
                const context = this.getContextAround(lines, lineIndex, match.index, 50);
                matches.push({
                    filePath,
                    line: lineIndex + 1,
                    column: match.index + 1,
                    context,
                    matchedText: match[0],
                    formatType: format.name
                });
            }
        });
        return matches;
    }
    /**
     * Extract clean token name from matched text
     */
    extractTokenName(matchedText, format) {
        // Remove format-specific syntax to get clean token name
        const match = format.pattern.exec(matchedText);
        if (match && match[1]) {
            return match[1]; // Return first capture group
        }
        return matchedText;
    }
    /**
     * Categorize token based on name patterns
     */
    categorizeToken(tokenName) {
        const name = tokenName.toLowerCase();
        if (name.includes('color') || name.includes('bg') || name.includes('text') || name.match(/^(red|blue|green|yellow|purple|gray|black|white)/)) {
            return 'color';
        }
        if (name.includes('font') || name.includes('text') || name.includes('size') || name.includes('weight') || name.includes('family')) {
            return 'typography';
        }
        if (name.includes('spacing') || name.includes('margin') || name.includes('padding') || name.includes('gap') || name.match(/^(xs|sm|md|lg|xl)/)) {
            return 'spacing';
        }
        if (name.includes('shadow') || name.includes('elevation')) {
            return 'shadow';
        }
        if (name.includes('border') || name.includes('radius') || name.includes('stroke')) {
            return 'border';
        }
        if (name.includes('duration') || name.includes('timing') || name.includes('ease')) {
            return 'animation';
        }
        if (name.includes('breakpoint') || name.includes('screen') || name.includes('mobile') || name.includes('tablet') || name.includes('desktop')) {
            return 'breakpoint';
        }
        return undefined;
    }
    /**
     * Get context around a match
     */
    getContextAround(lines, lineIndex, charIndex, contextLength) {
        const line = lines[lineIndex];
        const start = Math.max(0, charIndex - contextLength);
        const end = Math.min(line.length, charIndex + contextLength);
        return line.substring(start, end);
    }
    /**
     * Scan for design pattern usage
     */
    async scanForPatterns(filePath, repoPath) {
        // This is a simplified pattern detection - in reality you'd have more sophisticated pattern matching
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        const relativePath = path_1.default.relative(repoPath, filePath);
        const patterns = [];
        // Common pattern signatures
        const patternSignatures = [
            { name: 'Button', pattern: /class.*button|<Button|btn-/gi, complexity: 'simple' },
            { name: 'Card', pattern: /class.*card|<Card|\.card/gi, complexity: 'medium' },
            { name: 'Modal', pattern: /class.*modal|<Modal|\.modal/gi, complexity: 'complex' },
            { name: 'Form', pattern: /class.*form|<Form|\.form/gi, complexity: 'medium' },
            { name: 'Navigation', pattern: /class.*nav|<Nav|\.nav/gi, complexity: 'complex' }
        ];
        patternSignatures.forEach(signature => {
            const matches = content.match(signature.pattern);
            if (matches && matches.length > 0) {
                patterns.push({
                    patternName: signature.name,
                    tokenDependencies: [], // Would be populated by analyzing the pattern's token usage
                    usageCount: matches.length,
                    locations: [relativePath],
                    complexity: signature.complexity
                });
            }
        });
        return patterns;
    }
    /**
     * Aggregate token usages across files
     */
    aggregateTokenUsages(tokenUsages) {
        const aggregated = new Map();
        tokenUsages.forEach(usage => {
            const key = `${usage.tokenName}-${usage.tokenType}`;
            if (aggregated.has(key)) {
                const existing = aggregated.get(key);
                existing.occurrences.push(...usage.occurrences);
                existing.totalCount += usage.totalCount;
                existing.files.push(...usage.files);
                existing.files = [...new Set(existing.files)]; // Remove duplicates
            }
            else {
                aggregated.set(key, { ...usage });
            }
        });
        // Sort by usage count (descending)
        return Array.from(aggregated.values())
            .sort((a, b) => b.totalCount - a.totalCount);
    }
    /**
     * Aggregate pattern usages
     */
    aggregatePatterns(patterns) {
        const aggregated = new Map();
        patterns.forEach(pattern => {
            if (aggregated.has(pattern.patternName)) {
                const existing = aggregated.get(pattern.patternName);
                existing.usageCount += pattern.usageCount;
                existing.locations.push(...pattern.locations);
                existing.locations = [...new Set(existing.locations)];
            }
            else {
                aggregated.set(pattern.patternName, { ...pattern });
            }
        });
        return Array.from(aggregated.values())
            .sort((a, b) => b.usageCount - a.usageCount);
    }
    /**
     * Calculate coverage percentage
     */
    calculateCoverage(tokens) {
        // This is a simplified coverage calculation
        // In reality, you'd compare against a known list of available tokens
        const totalAvailableTokens = 250; // Example: total tokens in your design system
        const usedTokens = tokens.length;
        return Math.round((usedTokens / totalAvailableTokens) * 100);
    }
    /**
     * Generate comprehensive scan report
     */
    async generateScanReport(results) {
        const reportPath = this.config.outputPath || path_1.default.join(process.cwd(), 'scan-reports');
        await promises_1.default.mkdir(reportPath, { recursive: true });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFile = path_1.default.join(reportPath, `token-scan-${timestamp}.json`);
        const report = {
            scanDate: new Date(),
            totalRepositories: results.length,
            totalTokensFound: results.reduce((sum, r) => sum + r.totalUsage, 0),
            totalUniqueTokens: new Set(results.flatMap(r => r.tokensFound.map(t => t.tokenName))).size,
            repositories: results,
            summary: this.generateOverallSummary(results)
        };
        await promises_1.default.writeFile(reportFile, JSON.stringify(report, null, 2));
        console.log(`📊 Scan report generated: ${reportFile}`);
    }
    /**
     * Generate overall summary across all repositories
     */
    generateOverallSummary(results) {
        const allTokens = results.flatMap(r => r.tokensFound);
        const tokensByCategory = new Map();
        const teamUsage = new Map();
        allTokens.forEach(token => {
            // Count by category
            const category = token.category || 'uncategorized';
            tokensByCategory.set(category, (tokensByCategory.get(category) || 0) + token.totalCount);
        });
        results.forEach(result => {
            // Count by team
            const team = result.repository.team;
            const totalUsage = result.totalUsage;
            teamUsage.set(team, (teamUsage.get(team) || 0) + totalUsage);
        });
        return {
            totalFiles: results.reduce((sum, r) => sum + r.summary.totalFiles, 0),
            averageCoverage: results.reduce((sum, r) => sum + r.coverage, 0) / results.length,
            tokensByCategory: Object.fromEntries(tokensByCategory),
            teamUsage: Object.fromEntries(teamUsage),
            topTokens: allTokens
                .sort((a, b) => b.totalCount - a.totalCount)
                .slice(0, 10)
                .map(t => ({ name: t.tokenName, usage: t.totalCount, category: t.category }))
        };
    }
}
exports.TokenScanner = TokenScanner;
//# sourceMappingURL=TokenScanner.js.map