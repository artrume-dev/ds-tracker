import { TokenDictionaryService, tokenDictionary } from './TokenDictionary';

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
export class TokenCategorizer {
  
    /**
   * Primary categorization method - now uses Token Dictionary first
   */
  static categorizeToken(tokenName: string, filePath?: string): TokenCategory {
    // First, try to get from token dictionary
    const dictionaryResult = tokenDictionary.enhanceTokenInfo(tokenName);
    if (dictionaryResult.category.category !== 'Other') {
      return {
        type: dictionaryResult.category.type as 'raw' | 'foundation' | 'component',
        category: dictionaryResult.category.category,
        subcategory: dictionaryResult.category.subcategory,
        purpose: dictionaryResult.category.purpose
      };
    }

    // Fallback to original heuristic categorization
    if (this.isRawToken(tokenName)) {
      return this.categorizeRawToken(tokenName);
    }
    
    if (this.isFoundationToken(tokenName, filePath)) {
      return this.categorizeFoundationToken(tokenName, filePath);
    }
    
    return this.categorizeComponentToken(tokenName, filePath);
  }

  /**
   * Check if token is a raw token (basic values)
   */
  private static isRawToken(tokenName: string): boolean {
    const rawPatterns = [
      /^\$(?:black|white|gray-\d+)$/, // Bootstrap colors
      /^\$(?:primary|secondary|success|danger|warning|info|light|dark)/, // Bootstrap theme colors
      /^(?:space-\d+|[0-9]+)$/, // Raw spacing values
      /^(?:100|200|300|400|500|600|700|800|900)$/, // Font weights
      /^(?:xs|sm|md|lg|xl|xxl)$/, // Raw sizes
    ];
    
    return rawPatterns.some(pattern => pattern.test(tokenName));
  }

  /**
   * Check if token is a foundation token (design system level)
   */
  private static isFoundationToken(tokenName: string, filePath?: string): boolean {
    const foundationPatterns = [
      /^\$cds-/, // Canon Design System tokens
      /^@include (?:theme|font-size-line-height|media-breakpoint-)/, // Foundation mixins
    ];
    
    const foundationPaths = [
      /foundation\//,
      /theme\//,
      /core\//,
      /_tokens\.scss$/,
      /_themeMixins\.scss$/,
    ];
    
    const hasFoundationPattern = foundationPatterns.some(pattern => pattern.test(tokenName));
    const hasFoundationPath = filePath ? foundationPaths.some(pattern => pattern.test(filePath)) : false;
    
    return hasFoundationPattern || hasFoundationPath;
  }

  /**
   * Categorize raw tokens
   */
  private static categorizeRawToken(tokenName: string): TokenCategory {
    if (/^\$(?:black|white|gray-\d+)$/.test(tokenName) || /^(?:white)$/.test(tokenName)) {
      return {
        type: 'raw',
        category: 'Colors',
        subcategory: 'Base Colors',
        purpose: 'Basic color values for the design system'
      };
    }
    
    if (/^\$(?:primary|secondary|success|danger|warning|info|light|dark)/.test(tokenName)) {
      return {
        type: 'raw',
        category: 'Colors',
        subcategory: 'Theme Colors',
        purpose: 'Semantic color values for UI states'
      };
    }
    
    if (/^(?:space-\d+|[0-9]+)$/.test(tokenName)) {
      return {
        type: 'raw',
        category: 'Spacing',
        purpose: 'Raw spacing values in pixels or rem units'
      };
    }
    
    if (/^(?:100|200|300|400|500|600|700|800|900)$/.test(tokenName)) {
      return {
        type: 'raw',
        category: 'Typography',
        subcategory: 'Font Weight',
        purpose: 'Font weight values'
      };
    }
    
    return {
      type: 'raw',
      category: 'General',
      purpose: 'Raw design values'
    };
  }

  /**
   * Categorize foundation tokens
   */
  private static categorizeFoundationToken(tokenName: string, filePath?: string): TokenCategory {
    if (tokenName.startsWith('$cds-')) {
      if (tokenName.includes('color') || tokenName.includes('white') || tokenName.includes('black') || tokenName.includes('red')) {
        return {
          type: 'foundation',
          category: 'Colors',
          subcategory: 'CDS Colors',
          purpose: 'Canon Design System color tokens'
        };
      }
      
      if (tokenName.includes('space')) {
        return {
          type: 'foundation',
          category: 'Spacing',
          subcategory: 'CDS Spacing',
          purpose: 'Canon Design System spacing tokens'
        };
      }
      
      return {
        type: 'foundation',
        category: 'Design System',
        subcategory: 'CDS Tokens',
        purpose: 'Canon Design System foundation tokens'
      };
    }
    
    if (tokenName.startsWith('@include theme')) {
      return {
        type: 'foundation',
        category: 'Theme',
        subcategory: 'Theme Mixins',
        purpose: 'Theme switching and theming functionality'
      };
    }
    
    if (tokenName.startsWith('@include font-size-line-height')) {
      return {
        type: 'foundation',
        category: 'Typography',
        subcategory: 'Typography Mixins',
        purpose: 'Font sizing and line height utilities'
      };
    }
    
    if (tokenName.startsWith('@include media-breakpoint')) {
      return {
        type: 'foundation',
        category: 'Layout',
        subcategory: 'Responsive Mixins',
        purpose: 'Responsive breakpoint utilities'
      };
    }
    
    if (filePath?.includes('foundation/spacing')) {
      return {
        type: 'foundation',
        category: 'Spacing',
        subcategory: 'Spacing System',
        purpose: 'Foundation spacing scale'
      };
    }
    
    if (filePath?.includes('core/typography')) {
      return {
        type: 'foundation',
        category: 'Typography',
        subcategory: 'Typography System',
        purpose: 'Foundation typography scale and utilities'
      };
    }
    
    return {
      type: 'foundation',
      category: 'Design System',
      purpose: 'Foundation design system tokens'
    };
  }

  /**
   * Categorize component tokens
   */
  private static categorizeComponentToken(tokenName: string, filePath?: string): TokenCategory {
    const componentName = this.extractComponentName(filePath);
    
    if (filePath?.includes('components/')) {
      return {
        type: 'component',
        category: 'Components',
        subcategory: componentName || 'Generic Component',
        purpose: `Component-specific styling for ${componentName || 'UI components'}`
      };
    }
    
    if (filePath?.includes('_utils.scss')) {
      return {
        type: 'component',
        category: 'Utilities',
        subcategory: 'Utility Classes',
        purpose: 'Utility classes and helper styles'
      };
    }
    
    return {
      type: 'component',
      category: 'Components',
      purpose: 'Component-level styling tokens'
    };
  }

  /**
   * Extract component name from file path
   */
  private static extractComponentName(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    
    const componentMatch = filePath.match(/components\/_?([^\/]+)\.scss$/);
    if (componentMatch) {
      return componentMatch[1].charAt(0).toUpperCase() + componentMatch[1].slice(1);
    }
    
    return undefined;
  }

  /**
   * Analyze pattern usage - which patterns use which token types
   */
  static analyzePatternUsage(tokenUsages: any[]): PatternUsage[] {
    const patternMap = new Map<string, PatternUsage>();
    
    tokenUsages.forEach(usage => {
      usage.usages.forEach((tokenUsage: any) => {
        const pattern = this.extractPatternName(tokenUsage.filePath, tokenUsage.context);
        if (!pattern) return;
        
        const category = this.categorizeToken(usage.tokenName, tokenUsage.filePath);
        
        if (!patternMap.has(pattern.name)) {
          patternMap.set(pattern.name, {
            patternName: pattern.name,
            type: pattern.type,
            tokensUsed: { raw: [], foundation: [], component: [] },
            count: 0
          });
        }
        
        const patternUsage = patternMap.get(pattern.name)!;
        patternUsage.count++;
        
        if (!patternUsage.tokensUsed[category.type].includes(usage.tokenName)) {
          patternUsage.tokensUsed[category.type].push(usage.tokenName);
        }
      });
    });
    
    return Array.from(patternMap.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Extract pattern name from file path and context
   */
  private static extractPatternName(filePath: string, context?: string): { name: string; type: 'component' | 'mixin' | 'utility' } | null {
    // Component patterns
    const componentMatch = filePath.match(/components\/_?([^\/]+)\.scss$/);
    if (componentMatch) {
      return {
        name: componentMatch[1].charAt(0).toUpperCase() + componentMatch[1].slice(1),
        type: 'component'
      };
    }
    
    // Mixin patterns
    if (filePath.includes('_themeMixins.scss') || filePath.includes('mixins/')) {
      const mixinMatch = context?.match(/@include\s+([^\s(]+)/);
      if (mixinMatch) {
        return {
          name: mixinMatch[1],
          type: 'mixin'
        };
      }
    }
    
    // Utility patterns
    if (filePath.includes('_utils.scss') || filePath.includes('utilities/')) {
      return {
        name: 'Utilities',
        type: 'utility'
      };
    }
    
    return null;
  }
}
