"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANON_TEAM_CONFIGS = exports.CANON_SCAN_CONFIG = exports.CANON_EXCLUDE_PATTERNS = exports.CANON_INCLUDE_PATTERNS = exports.CANON_REPOSITORIES = exports.CANON_TOKEN_FORMATS = void 0;
exports.getCanonTeamConfig = getCanonTeamConfig;
exports.getCanonConfig = getCanonConfig;
/**
 * Canon Design System specific token formats
 * Based on actual Canon SCSS structure with $cds- prefix
 */
exports.CANON_TOKEN_FORMATS = [
    // Primary: Canon Design System SCSS Variables (actual structure)
    {
        name: 'canon-cds-variables',
        pattern: /\$cds-([a-zA-Z0-9_-]+(?:-\d+)?)/g,
        fileExtensions: ['scss', 'sass'],
        description: 'Canon Design System Variables ($cds-*)'
    },
    // Bootstrap/Foundation SCSS Variables (Canon extends Bootstrap)
    {
        name: 'canon-bootstrap-variables',
        pattern: /\$(?:gray|white|black|primary|secondary|success|info|warning|danger)-?(\d+)?/g,
        fileExtensions: ['scss', 'sass'],
        description: 'Canon Bootstrap Variables'
    },
    // Color Variables (specific Canon color pattern)
    {
        name: 'canon-color-variables',
        pattern: /\$(?:cds-)?(?:red|blue|green|yellow|purple|orange|gray|black|white)-?(\d+)?/g,
        fileExtensions: ['scss', 'sass'],
        description: 'Canon Color Variables'
    },
    // SCSS Mixins and Functions
    {
        name: 'canon-scss-mixins',
        pattern: /@(?:include|mixin)\s+(cds-|canon-)?([a-zA-Z0-9_-]+)/g,
        fileExtensions: ['scss', 'sass'],
        description: 'Canon SCSS Mixins and Functions'
    },
    // SCSS Map References  
    {
        name: 'canon-scss-maps',
        pattern: /map-(?:get|merge)\(\$([^,\)]+),?\s*['"']?([^'",\)]*)['"']?\)?/g,
        fileExtensions: ['scss', 'sass'],
        description: 'Canon SCSS Map References'
    },
    // JavaScript Token Objects
    {
        name: 'canon-js-tokens',
        pattern: /(?:canonTokens|canonTheme|designTokens)\.([a-zA-Z0-9._-]+)/g,
        fileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
        description: 'Canon JavaScript Token Objects'
    },
    // Styled Components Theme (if using styled-components)
    {
        name: 'canon-styled-theme',
        pattern: /\$\{(?:props\s*=>\s*)?(?:props\.)?theme\.canon\.([^}]+)\}/g,
        fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
        description: 'Canon Styled Components Theme References'
    },
    // Tailwind Classes (if Canon has custom Tailwind setup)
    {
        name: 'canon-tailwind-classes',
        pattern: /(?:class(?:Name)?=["']|@apply\s+)([^"']*(?:canon-|cds-)[^"']*)/g,
        fileExtensions: ['html', 'jsx', 'tsx', 'vue', 'svelte'],
        description: 'Canon Tailwind CSS Classes'
    },
    // Design Token JSON files
    {
        name: 'canon-token-files',
        pattern: /"([^"]*(?:canon|token)[^"]*)"/g,
        fileExtensions: ['json'],
        description: 'Canon Design Token JSON Files'
    },
    // React Component Props (if tokens passed as props)
    {
        name: 'canon-component-props',
        pattern: /(?:color|theme|variant|size)=["']([^"']*(?:canon-|primary-|secondary-)[^"']*)["']/g,
        fileExtensions: ['jsx', 'tsx'],
        description: 'Canon Component Theme Props'
    }
];
/**
 * Canon Repositories Configuration
 * Currently configured for local Canon Design System repository
 */
exports.CANON_REPOSITORIES = [
    // Design System Repository (main source of truth) - LOCAL PATH
    {
        url: '/Users/samarmustafa/Documents/Samar/ssd-dev/canon-design-system-repo',
        name: 'canon-design-system',
        team: 'Design System',
        type: 'website',
        branch: 'main'
    },
    // Marketing Website Repository - LOCAL PATH FOR TESTING
    {
        url: '/Users/samarmustafa/Documents/Samar/ssd-dev/marketing-website-repo',
        name: 'marketing-website',
        team: 'Marketing',
        type: 'website',
        branch: 'main'
    }
    // NOTE: Add more repositories when they become available
    // Example for future use:
    // {
    //   url: 'https://github.com/canon/ecommerce-platform',
    //   name: 'ecommerce-platform',
    //   team: 'E-commerce',
    //   type: 'website' as const,
    //   branch: 'main'
    // }
];
/**
 * Canon-specific file patterns
 * Prioritized for SCSS-based projects
 */
exports.CANON_INCLUDE_PATTERNS = [
    // SCSS/Sass files (highest priority)
    'src/**/*.{scss,sass}',
    'styles/**/*.{scss,sass}',
    'assets/styles/**/*.{scss,sass}',
    'scss/**/*',
    'sass/**/*',
    // Design token specific directories
    'tokens/**/*.{scss,sass,json}',
    'theme/**/*.{scss,sass}',
    'design-system/**/*.{scss,sass}',
    'foundations/**/*.{scss,sass}',
    'primitives/**/*.{scss,sass}',
    // Component stylesheets
    'components/**/*.{scss,sass}',
    'canon-components/**/*.{scss,sass}',
    // Other web assets
    'src/**/*.{css,js,jsx,ts,tsx}',
    'pages/**/*',
    'views/**/*',
    'templates/**/*',
    // Configuration files
    'tailwind.config.*',
    'webpack.config.*',
    'vite.config.*',
    // Documentation and Stories
    'docs/**/*.{md,mdx}',
    'storybook/**/*',
    'src/stories/**/*',
    'stories/**/*',
    // Package and build files
    'package.json',
    '*.config.js',
];
exports.CANON_EXCLUDE_PATTERNS = [
    // Standard exclusions
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/storybook-static/**',
    // Canon-specific exclusions
    '**/legacy/**',
    '**/deprecated/**',
    '**/archive/**',
    '**/backup/**',
    // Large asset files
    '**/*.{png,jpg,jpeg,gif,svg,ico}',
    '**/*.{mp4,mov,avi}',
    '**/*.{pdf,doc,docx}',
];
/**
 * Canon Design System Configuration
 * This replaces the mock data with real repository scanning
 */
exports.CANON_SCAN_CONFIG = {
    repositories: exports.CANON_REPOSITORIES,
    tokenFormats: exports.CANON_TOKEN_FORMATS,
    includePatterns: exports.CANON_INCLUDE_PATTERNS,
    excludePatterns: exports.CANON_EXCLUDE_PATTERNS,
    outputPath: './scan-reports'
};
/**
 * Team-specific configurations for Canon teams
 * Currently only Design System team is available with local repository
 */
exports.CANON_TEAM_CONFIGS = {
    'design-system': {
        ...exports.CANON_SCAN_CONFIG,
        repositories: exports.CANON_REPOSITORIES.filter(repo => repo.team === 'Design System'),
        includePatterns: [
            ...exports.CANON_INCLUDE_PATTERNS,
            'tokens/**/*',
            'foundations/**/*',
            'primitives/**/*'
        ]
    },
    // Future team configurations (when repositories become available)
    marketing: {
        ...exports.CANON_SCAN_CONFIG,
        repositories: exports.CANON_REPOSITORIES.filter(repo => repo.team === 'Marketing'),
        includePatterns: [
            ...exports.CANON_INCLUDE_PATTERNS,
            'campaigns/**/*',
            'landing-pages/**/*',
            'email-templates/**/*'
        ]
    },
    ecommerce: {
        ...exports.CANON_SCAN_CONFIG,
        repositories: exports.CANON_REPOSITORIES.filter(repo => repo.team === 'E-commerce'),
        includePatterns: [
            ...exports.CANON_INCLUDE_PATTERNS,
            'checkout/**/*',
            'product-pages/**/*',
            'cart/**/*'
        ]
    },
    mobile: {
        ...exports.CANON_SCAN_CONFIG,
        repositories: exports.CANON_REPOSITORIES.filter(repo => repo.team.includes('Mobile')),
        tokenFormats: exports.CANON_TOKEN_FORMATS.filter(format => ['canon-js-tokens', 'canon-styled-theme', 'canon-component-props'].includes(format.name)),
        includePatterns: [
            'src/**/*.{js,jsx,ts,tsx}',
            'components/**/*',
            'screens/**/*',
            'styles/**/*'
        ]
    }
};
/**
 * Helper function to get Canon team configuration
 */
function getCanonTeamConfig(team) {
    const teamKey = team.toLowerCase().replace(/\s+/g, '-');
    return exports.CANON_TEAM_CONFIGS[teamKey] || exports.CANON_SCAN_CONFIG;
}
/**
 * Environment-based configuration
 */
function getCanonConfig() {
    // You can override repositories via environment variables
    const customRepos = process.env.CANON_REPOSITORIES;
    if (customRepos) {
        try {
            const repos = JSON.parse(customRepos);
            return {
                ...exports.CANON_SCAN_CONFIG,
                repositories: repos
            };
        }
        catch (error) {
            console.warn('Invalid CANON_REPOSITORIES environment variable, using default config');
        }
    }
    return exports.CANON_SCAN_CONFIG;
}
//# sourceMappingURL=canon-config.js.map