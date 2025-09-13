/**
 * Token Dictionary for Canon Design System
 * This provides a comprehensive mapping of design tokens to improve
 * detection accuracy and categorization.
 */
export interface TokenDefinition {
    name: string;
    category: 'raw' | 'foundation' | 'component';
    type: 'color' | 'spacing' | 'typography' | 'size' | 'border' | 'shadow' | 'animation' | 'layout' | 'theme';
    subcategory?: string;
    description?: string;
    value?: string;
    sassVariable?: string;
    cssProperty?: string;
    deprecated?: boolean;
    aliases?: string[];
}
export interface TokenDictionary {
    [tokenName: string]: TokenDefinition;
}
/**
 * Canon Design System Token Dictionary
 * Extracted from analysis of SCSS files and Canon documentation
 */
export declare const CANON_TOKEN_DICTIONARY: TokenDictionary;
/**
 * Token Dictionary Utilities
 */
export declare class TokenDictionaryService {
    private dictionary;
    constructor(customDictionary?: TokenDictionary);
    /**
     * Get token definition by name
     */
    getTokenDefinition(tokenName: string): TokenDefinition | null;
    /**
     * Check if a token exists in the dictionary
     */
    isKnownToken(tokenName: string): boolean;
    /**
     * Get all tokens by category
     */
    getTokensByCategory(category: 'raw' | 'foundation' | 'component'): TokenDefinition[];
    /**
     * Get all tokens by type
     */
    getTokensByType(type: string): TokenDefinition[];
    /**
     * Enhance token information using dictionary
     */
    enhanceTokenInfo(tokenName: string, defaultCategory?: 'raw' | 'foundation' | 'component'): {
        tokenName: string;
        category: {
            type: 'raw' | 'foundation' | 'component';
            category: string;
            subcategory?: string;
            purpose: string;
        };
    };
    /**
     * Categorize token by naming patterns if not in dictionary
     */
    private categorizeTokenByPattern;
    /**
     * Convert technical type to human-readable category
     */
    private getHumanReadableCategory;
    /**
     * Add new token definitions (for dynamic discovery)
     */
    addTokenDefinition(tokenName: string, definition: TokenDefinition): void;
    /**
     * Update existing token definition
     */
    updateTokenDefinition(tokenName: string, updates: Partial<TokenDefinition>): boolean;
    /**
     * Get dictionary statistics
     */
    getStatistics(): {
        total: number;
        raw: number;
        foundation: number;
        component: number;
        byType: {
            [key: string]: number;
        };
    };
}
/**
 * Default instance for use throughout the application
 */
export declare const tokenDictionary: TokenDictionaryService;
//# sourceMappingURL=TokenDictionary.d.ts.map