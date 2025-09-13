export interface TokenCategory {
    type: 'raw' | 'foundation' | 'component';
    category: string;
    subcategory?: string;
    purpose: string;
}
export interface CategorizedToken {
    tokenName: string;
    count: number;
    category: TokenCategory;
    patterns?: string[];
}
export interface PatternUsage {
    patternName: string;
    type: 'component' | 'mixin' | 'utility';
    tokensUsed: {
        raw: string[];
        foundation: string[];
        component: string[];
    };
    count: number;
}
/**
 * Categorizes Canon Design System tokens based on their name and file path
 */
export declare class TokenCategorizer {
    /**
   * Primary categorization method - now uses Token Dictionary first
   */
    static categorizeToken(tokenName: string, filePath?: string): TokenCategory;
    /**
     * Check if token is a raw token (basic values)
     */
    private static isRawToken;
    /**
     * Check if token is a foundation token (design system level)
     */
    private static isFoundationToken;
    /**
     * Categorize raw tokens
     */
    private static categorizeRawToken;
    /**
     * Categorize foundation tokens
     */
    private static categorizeFoundationToken;
    /**
     * Categorize component tokens
     */
    private static categorizeComponentToken;
    /**
     * Extract component name from file path
     */
    private static extractComponentName;
    /**
     * Analyze pattern usage - which patterns use which token types
     */
    static analyzePatternUsage(tokenUsages: any[]): PatternUsage[];
    /**
     * Extract pattern name from file path and context
     */
    private static extractPatternName;
}
//# sourceMappingURL=tokenCategorizer.d.ts.map