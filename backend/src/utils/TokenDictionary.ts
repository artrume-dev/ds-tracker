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
export const CANON_TOKEN_DICTIONARY: TokenDictionary = {
  // Raw Color Tokens (Foundation level)
  '$cds-black': {
    name: '$cds-black',
    category: 'raw',
    type: 'color',
    subcategory: 'Base Colors',
    description: 'Primary black color',
    sassVariable: '$cds-black',
  },
  '$cds-white': {
    name: '$cds-white',
    category: 'raw',
    type: 'color',
    subcategory: 'Base Colors',
    description: 'Primary white color',
    sassVariable: '$cds-white',
  },
  '$cds-red': {
    name: '$cds-red',
    category: 'raw',
    type: 'color',
    subcategory: 'Brand Colors',
    description: 'Canon brand red',
    sassVariable: '$cds-red',
  },
  '$cds-blue': {
    name: '$cds-blue',
    category: 'raw',
    type: 'color',
    subcategory: 'Brand Colors', 
    description: 'Canon brand blue',
    sassVariable: '$cds-blue',
  },
  '$cds-blue-100': {
    name: '$cds-blue-100',
    category: 'raw',
    type: 'color',
    subcategory: 'Blue Scale',
    description: 'Light blue tint',
    sassVariable: '$cds-blue-100',
  },
  '$cds-blue-200': {
    name: '$cds-blue-200',
    category: 'raw',
    type: 'color',
    subcategory: 'Blue Scale',
    description: 'Medium blue tint',
    sassVariable: '$cds-blue-200',
  },
  '$cds-grey-100': {
    name: '$cds-grey-100',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Lightest grey',
    sassVariable: '$cds-grey-100',
  },
  '$cds-grey-200': {
    name: '$cds-grey-200',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Light grey',
    sassVariable: '$cds-grey-200',
  },
  '$cds-grey-300': {
    name: '$cds-grey-300',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Medium light grey',
    sassVariable: '$cds-grey-300',
  },
  '$cds-grey-400': {
    name: '$cds-grey-400',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Medium grey',
    sassVariable: '$cds-grey-400',
  },
  '$cds-grey-500': {
    name: '$cds-grey-500',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Medium dark grey',
    sassVariable: '$cds-grey-500',
  },
  '$cds-grey-600': {
    name: '$cds-grey-600',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Dark grey',
    sassVariable: '$cds-grey-600',
  },
  '$cds-grey-700': {
    name: '$cds-grey-700',
    category: 'raw',
    type: 'color',
    subcategory: 'Grey Scale',
    description: 'Darker grey',
    sassVariable: '$cds-grey-700',
  },
  '$cds-ochre': {
    name: '$cds-ochre',
    category: 'raw',
    type: 'color',
    subcategory: 'Brand Colors',
    description: 'Canon ochre accent color',
    sassVariable: '$cds-ochre',
  },

  // Foundation Color Tokens (Semantic)
  '$cds-border-color-blue': {
    name: '$cds-border-color-blue',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Blue border color',
    sassVariable: '$cds-border-color-blue',
  },
  '$cds-border-color-blue-light': {
    name: '$cds-border-color-blue-light',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Light blue border color',
    sassVariable: '$cds-border-color-blue-light',
  },
  '$cds-border-color-red': {
    name: '$cds-border-color-red',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Red border color',
    sassVariable: '$cds-border-color-red',
  },
  '$cds-border-color-black': {
    name: '$cds-border-color-black',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Black border color',
    sassVariable: '$cds-border-color-black',
  },
  '$cds-border-color-white': {
    name: '$cds-border-color-white',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'White border color',
    sassVariable: '$cds-border-color-white',
  },
  '$cds-border-color-grey-darkest': {
    name: '$cds-border-color-grey-darkest',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Darkest grey border color',
    sassVariable: '$cds-border-color-grey-darkest',
  },
  '$cds-border-color-grey-darker': {
    name: '$cds-border-color-grey-darker',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Darker grey border color',
    sassVariable: '$cds-border-color-grey-darker',
  },
  '$cds-border-color-grey-dark': {
    name: '$cds-border-color-grey-dark',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Dark grey border color',
    sassVariable: '$cds-border-color-grey-dark',
  },
  '$cds-border-color-grey': {
    name: '$cds-border-color-grey',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Grey border color',
    sassVariable: '$cds-border-color-grey',
  },
  '$cds-border-color-grey-light': {
    name: '$cds-border-color-grey-light',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Light grey border color',
    sassVariable: '$cds-border-color-grey-light',
  },
  '$cds-border-color-grey-lighter': {
    name: '$cds-border-color-grey-lighter',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Lighter grey border color',
    sassVariable: '$cds-border-color-grey-lighter',
  },
  '$cds-border-color-grey-lightest': {
    name: '$cds-border-color-grey-lightest',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Lightest grey border color',
    sassVariable: '$cds-border-color-grey-lightest',
  },
  '$cds-border-color-ochre': {
    name: '$cds-border-color-ochre',
    category: 'foundation',
    type: 'color',
    subcategory: 'Border Colors',
    description: 'Ochre border color',
    sassVariable: '$cds-border-color-ochre',
  },

  // Background Colors
  '$cds-bg-color-blue': {
    name: '$cds-bg-color-blue',
    category: 'foundation',
    type: 'color',
    subcategory: 'Background Colors',
    description: 'Blue background color',
    sassVariable: '$cds-bg-color-blue',
  },
  '$cds-bg-color-blue-light': {
    name: '$cds-bg-color-blue-light',
    category: 'foundation',
    type: 'color',
    subcategory: 'Background Colors',
    description: 'Light blue background color',
    sassVariable: '$cds-bg-color-blue-light',
  },

  // Spacing Tokens
  'space-4': {
    name: 'space-4',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '4px spacing unit',
  },
  'space-8': {
    name: 'space-8',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '8px spacing unit',
  },
  'space-12': {
    name: 'space-12',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '12px spacing unit',
  },
  'space-16': {
    name: 'space-16',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '16px spacing unit',
  },
  'space-20': {
    name: 'space-20',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '20px spacing unit',
  },
  'space-24': {
    name: 'space-24',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '24px spacing unit',
  },
  'space-32': {
    name: 'space-32',
    category: 'foundation',
    type: 'spacing',
    subcategory: 'Base Spacing',
    description: '32px spacing unit',
  },

  // SCSS Mixins and Functions (Foundation level)
  '@include theme': {
    name: '@include theme',
    category: 'foundation',
    type: 'theme',
    subcategory: 'Theme Mixins',
    description: 'Core theming mixin for applying theme tokens',
  },
  '@include media-breakpoint-up': {
    name: '@include media-breakpoint-up',
    category: 'foundation',
    type: 'layout',
    subcategory: 'Responsive Mixins',
    description: 'Bootstrap responsive breakpoint mixin',
  },
  '@include media-breakpoint-down': {
    name: '@include media-breakpoint-down',
    category: 'foundation',
    type: 'layout',
    subcategory: 'Responsive Mixins',
    description: 'Bootstrap responsive breakpoint mixin',
  },
  '@include media-breakpoint-between': {
    name: '@include media-breakpoint-between',
    category: 'foundation',
    type: 'layout',
    subcategory: 'Responsive Mixins',
    description: 'Bootstrap responsive breakpoint mixin',
  },
  '@include make-container': {
    name: '@include make-container',
    category: 'foundation',
    type: 'layout',
    subcategory: 'Layout Mixins',
    description: 'Bootstrap container mixin',
  },

  // Component-level tokens would be added as they're discovered
  // These are more specific implementations using foundation tokens
};

/**
 * Token Dictionary Utilities
 */
export class TokenDictionaryService {
  private dictionary: TokenDictionary;

  constructor(customDictionary?: TokenDictionary) {
    this.dictionary = { ...CANON_TOKEN_DICTIONARY, ...customDictionary };
  }

  /**
   * Get token definition by name
   */
  getTokenDefinition(tokenName: string): TokenDefinition | null {
    // Try exact match first
    if (this.dictionary[tokenName]) {
      return this.dictionary[tokenName];
    }

    // Try with $ prefix for SCSS variables
    const withDollar = tokenName.startsWith('$') ? tokenName : `$${tokenName}`;
    if (this.dictionary[withDollar]) {
      return this.dictionary[withDollar];
    }

    // Try without $ prefix
    const withoutDollar = tokenName.startsWith('$') ? tokenName.slice(1) : tokenName;
    if (this.dictionary[withoutDollar]) {
      return this.dictionary[withoutDollar];
    }

    // Search in aliases
    for (const [key, definition] of Object.entries(this.dictionary)) {
      if (definition.aliases?.includes(tokenName)) {
        return definition;
      }
    }

    return null;
  }

  /**
   * Check if a token exists in the dictionary
   */
  isKnownToken(tokenName: string): boolean {
    return this.getTokenDefinition(tokenName) !== null;
  }

  /**
   * Get all tokens by category
   */
  getTokensByCategory(category: 'raw' | 'foundation' | 'component'): TokenDefinition[] {
    return Object.values(this.dictionary).filter(token => token.category === category);
  }

  /**
   * Get all tokens by type
   */
  getTokensByType(type: string): TokenDefinition[] {
    return Object.values(this.dictionary).filter(token => token.type === type);
  }

  /**
   * Enhance token information using dictionary
   */
  enhanceTokenInfo(tokenName: string, defaultCategory: 'raw' | 'foundation' | 'component' = 'raw'): { tokenName: string; category: { type: 'raw' | 'foundation' | 'component'; category: string; subcategory?: string; purpose: string } } {
    const definition = this.getTokenDefinition(tokenName);
    
    if (definition) {
      return {
        tokenName,
        category: {
          type: definition.category,
          category: this.getHumanReadableCategory(definition.type),
          subcategory: definition.subcategory,
          purpose: definition.description || `${definition.type} token`
        }
      };
    }

    // Fallback to heuristic categorization
    return this.categorizeTokenByPattern(tokenName, defaultCategory);
  }

  /**
   * Categorize token by naming patterns if not in dictionary
   */
  private categorizeTokenByPattern(tokenName: string, defaultCategory: 'raw' | 'foundation' | 'component'): { tokenName: string; category: { type: 'raw' | 'foundation' | 'component'; category: string; subcategory?: string; purpose: string } } {
    // Color patterns
    if (tokenName.match(/color|bg-color|border-color|text-color/)) {
      const isFoundation = tokenName.includes('border-color') || tokenName.includes('bg-color') || tokenName.includes('text-color');
      return {
        tokenName,
        category: {
          type: isFoundation ? 'foundation' : 'raw',
          category: 'Colors',
          subcategory: isFoundation ? 'Semantic Colors' : 'Base Colors',
          purpose: 'Color value for UI elements'
        }
      };
    }

    // Spacing patterns
    if (tokenName.match(/space-\d+|margin|padding|gap/)) {
      return {
        tokenName,
        category: {
          type: 'foundation',
          category: 'Spacing',
          subcategory: 'Layout Spacing',
          purpose: 'Spacing value for layout'
        }
      };
    }

    // Theme and mixin patterns
    if (tokenName.includes('@include')) {
      return {
        tokenName,
        category: {
          type: 'foundation',
          category: 'Theme System',
          subcategory: 'Mixins & Functions',
          purpose: 'SCSS mixin for theme application'
        }
      };
    }

    // Default fallback
    return {
      tokenName,
      category: {
        type: defaultCategory,
        category: 'Other',
        subcategory: 'Uncategorized',
        purpose: 'Design token'
      }
    };
  }

  /**
   * Convert technical type to human-readable category
   */
  private getHumanReadableCategory(type: string): string {
    const categoryMap: { [key: string]: string } = {
      'color': 'Colors',
      'spacing': 'Spacing',
      'typography': 'Typography',
      'size': 'Sizing',
      'border': 'Borders',
      'shadow': 'Shadows',
      'animation': 'Animation',
      'layout': 'Layout',
      'theme': 'Theme System'
    };

    return categoryMap[type] || 'Other';
  }

  /**
   * Add new token definitions (for dynamic discovery)
   */
  addTokenDefinition(tokenName: string, definition: TokenDefinition): void {
    this.dictionary[tokenName] = definition;
  }

  /**
   * Update existing token definition
   */
  updateTokenDefinition(tokenName: string, updates: Partial<TokenDefinition>): boolean {
    if (this.dictionary[tokenName]) {
      this.dictionary[tokenName] = { ...this.dictionary[tokenName], ...updates };
      return true;
    }
    return false;
  }

  /**
   * Get dictionary statistics
   */
  getStatistics() {
    const stats = {
      total: Object.keys(this.dictionary).length,
      raw: 0,
      foundation: 0,
      component: 0,
      byType: {} as { [key: string]: number }
    };

    Object.values(this.dictionary).forEach(token => {
      stats[token.category]++;
      stats.byType[token.type] = (stats.byType[token.type] || 0) + 1;
    });

    return stats;
  }
}

/**
 * Default instance for use throughout the application
 */
export const tokenDictionary = new TokenDictionaryService();
