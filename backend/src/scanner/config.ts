import { TokenScanConfig, TokenFormat } from './TokenScanner';

/**
 * Default token formats for different implementation methods
 */
export const DEFAULT_TOKEN_FORMATS: TokenFormat[] = [
  {
    name: 'css-variables',
    pattern: /var\(--([^)]+)\)/g,
    fileExtensions: ['css', 'scss', 'less', 'stylus'],
    description: 'CSS Custom Properties (CSS Variables)'
  },
  {
    name: 'scss-variables',
    pattern: /\$([a-zA-Z0-9_-]+)/g,
    fileExtensions: ['scss', 'sass'],
    description: 'SCSS/Sass Variables'
  },
  {
    name: 'js-tokens',
    pattern: /tokens\.([a-zA-Z0-9._-]+)/g,
    fileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
    description: 'JavaScript Token Objects'
  },
  {
    name: 'tailwind-classes',
    pattern: /(?:class(?:Name)?=["']|@apply\s+)([^"']*(?:text-|bg-|border-|space-|p-|m-|w-|h-|rounded-)[^"']*)/g,
    fileExtensions: ['html', 'jsx', 'tsx', 'vue', 'svelte'],
    description: 'Tailwind CSS Classes'
  },
  {
    name: 'styled-components',
    pattern: /\$\{(?:props\s*=>\s*)?(?:props\.)?theme\.([^}]+)\}/g,
    fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    description: 'Styled Components Theme References'
  },
  {
    name: 'design-tokens',
    pattern: /"([^"]*\.token[^"]*)"/g,
    fileExtensions: ['json', 'js', 'ts'],
    description: 'Design Token Files'
  }
];

/**
 * Default scan configuration for Canon Design System
 */
export const DEFAULT_SCAN_CONFIG: TokenScanConfig = {
  repositories: [
    // Example repositories - replace with actual Canon repositories
    {
      url: 'https://github.com/canon/marketing-website',
      name: 'marketing-website',
      team: 'Marketing',
      type: 'website',
      branch: 'main'
    },
    {
      url: 'https://github.com/canon/e-commerce-platform',
      name: 'e-commerce-platform',
      team: 'E-commerce',
      type: 'website',
      branch: 'main'
    },
    {
      url: 'https://github.com/canon/mobile-app',
      name: 'canon-mobile-app',
      team: 'Mobile',
      type: 'mobile-app',
      branch: 'develop'
    }
  ],
  tokenFormats: DEFAULT_TOKEN_FORMATS,
  includePatterns: [
    '**/*.{css,scss,sass,less}',
    '**/*.{js,jsx,ts,tsx}',
    '**/*.{html,vue,svelte}',
    '**/*.json',
    'src/**/*',
    'components/**/*',
    'styles/**/*'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/storybook-static/**'
  ],
  outputPath: './scan-reports'
};

/**
 * Team-specific configurations
 */
export const TEAM_CONFIGS = {
  marketing: {
    ...DEFAULT_SCAN_CONFIG,
    repositories: DEFAULT_SCAN_CONFIG.repositories.filter(repo => repo.team === 'Marketing'),
    includePatterns: [
      ...DEFAULT_SCAN_CONFIG.includePatterns,
      'templates/**/*',
      'assets/css/**/*'
    ]
  },
  
  ecommerce: {
    ...DEFAULT_SCAN_CONFIG,
    repositories: DEFAULT_SCAN_CONFIG.repositories.filter(repo => repo.team === 'E-commerce'),
    includePatterns: [
      ...DEFAULT_SCAN_CONFIG.includePatterns,
      'components/ui/**/*',
      'pages/**/*'
    ]
  },
  
  mobile: {
    ...DEFAULT_SCAN_CONFIG,
    repositories: DEFAULT_SCAN_CONFIG.repositories.filter(repo => repo.team === 'Mobile'),
    tokenFormats: DEFAULT_TOKEN_FORMATS.filter(format => 
      ['js-tokens', 'styled-components'].includes(format.name)
    ),
    includePatterns: [
      'src/**/*.{js,jsx,ts,tsx}',
      'components/**/*',
      'screens/**/*',
      'styles/**/*'
    ]
  }
};

/**
 * Canon Design System specific token patterns
 */
export const CANON_TOKEN_PATTERNS = {
  colors: /(?:canon-)?(?:color-|text-|bg-|border-)([a-z]+)-?(\d+)?/g,
  spacing: /(?:canon-)?(?:space-|spacing-|p-|m-|gap-)([a-z]+|\d+)/g,
  typography: /(?:canon-)?(?:font-|text-)([a-z]+)-?([a-z]+)?/g,
  shadows: /(?:canon-)?shadow-([a-z]+|\d+)/g,
  borders: /(?:canon-)?(?:border-|rounded-)([a-z]+|\d+)/g,
  animations: /(?:canon-)?(?:duration-|ease-)([a-z]+|\d+)/g
};

/**
 * Create custom scanner configuration
 */
export function createScanConfig(overrides: Partial<TokenScanConfig>): TokenScanConfig {
  return {
    ...DEFAULT_SCAN_CONFIG,
    ...overrides,
    tokenFormats: overrides.tokenFormats || DEFAULT_TOKEN_FORMATS,
    repositories: overrides.repositories || DEFAULT_SCAN_CONFIG.repositories,
    includePatterns: overrides.includePatterns || DEFAULT_SCAN_CONFIG.includePatterns,
    excludePatterns: overrides.excludePatterns || DEFAULT_SCAN_CONFIG.excludePatterns
  };
}

/**
 * Get configuration for specific team
 */
export function getTeamConfig(team: string): TokenScanConfig {
  const teamKey = team.toLowerCase() as keyof typeof TEAM_CONFIGS;
  return TEAM_CONFIGS[teamKey] || DEFAULT_SCAN_CONFIG;
}
