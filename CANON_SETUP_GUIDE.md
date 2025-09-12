# Canon Design System Token Tracking Setup Guide

## Overview
This guide explains how to connect real Canon Design System repositories to track actual token usage instead of using mock data.

## 🔧 Configuration Steps

### 1. Update Repository Configuration

Edit `/backend/src/scanner/config.ts` to replace mock repositories with real Canon repositories:

```typescript
export const DEFAULT_SCAN_CONFIG: TokenScanConfig = {
  repositories: [
    // Replace these with actual Canon repositories
    {
      url: '/Users/samarmustafa/Documents/Samar/ssd-dev/canon-design-system-repo',
      name: 'canon-design-system',
      team: 'Design System',
      type: 'website',
      branch: 'main'
    },
    {
      url: '/Users/samarmustafa/Documents/Samar/ssd-dev /marketing-website-repo',
      name: 'marketing-website', 
      team: 'Marketing',
      type: 'website',
      branch: 'main'
    },
    {
      url: 'https://github.com/canon/e-commerce-frontend',
      name: 'e-commerce-frontend',
      team: 'E-commerce',
      type: 'website', 
      branch: 'main'
    },
    {
      url: 'https://github.com/canon/mobile-app-ios',
      name: 'mobile-app-ios',
      team: 'Mobile iOS',
      type: 'mobile-app',
      branch: 'develop'
    },
    {
      url: 'https://github.com/canon/mobile-app-android', 
      name: 'mobile-app-android',
      team: 'Mobile Android',
      type: 'mobile-app',
      branch: 'develop'
    }
  ],
  // ... rest of config
};
```

### 2. Configure Canon-Specific Token Patterns

Update the `CANON_TOKEN_PATTERNS` to match your actual design token naming conventions:

```typescript
export const CANON_TOKEN_PATTERNS = {
  // Update these patterns based on your actual token naming
  colors: /(?:canon-|cds-)?(?:color-|text-|bg-|border-)([a-z]+)-?(\d+)?/g,
  spacing: /(?:canon-|cds-)?(?:space-|spacing-|p-|m-|gap-)([a-z]+|\d+)/g,
  typography: /(?:canon-|cds-)?(?:font-|text-)([a-z]+)-?([a-z]+)?/g,
  shadows: /(?:canon-|cds-)?shadow-([a-z]+|\d+)/g,
  borders: /(?:canon-|cds-)?(?:border-|rounded-)([a-z]+|\d+)/g,
  animations: /(?:canon-|cds-)?(?:duration-|ease-)([a-z]+|\d+)/g
};
```

### 3. Add Custom Token Formats

Add Canon-specific token formats to detect your design tokens:

```typescript
export const CANON_TOKEN_FORMATS: TokenFormat[] = [
  {
    name: 'canon-css-vars',
    pattern: /var\(--canon-([^)]+)\)/g,
    fileExtensions: ['css', 'scss', 'less'],
    description: 'Canon CSS Custom Properties'
  },
  {
    name: 'canon-js-tokens',
    pattern: /(?:canonTokens|designTokens)\.([a-zA-Z0-9._-]+)/g,
    fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    description: 'Canon JavaScript Token Objects'
  },
  {
    name: 'canon-theme-tokens',
    pattern: /theme\.canon\.([a-zA-Z0-9._-]+)/g,
    fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    description: 'Canon Theme Token References'
  },
  // Add more formats based on your implementation
];
```

## 🔐 Authentication Setup

### Option 1: GitHub Personal Access Token (Recommended)
1. Create a GitHub Personal Access Token with repository access
2. Add environment variable:
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

### Option 2: SSH Key Authentication  
1. Ensure your SSH key is configured for GitHub
2. Update repository URLs to use SSH format:
```typescript
url: 'git@github.com:canon/marketing-website.git'
```

### Option 3: Private Repository Access
For private repositories, you'll need either:
- Deploy keys for specific repositories
- GitHub App with repository permissions
- Organization-level access tokens

## 📁 File Structure Patterns

Update `includePatterns` and `excludePatterns` based on your codebase structure:

```typescript
includePatterns: [
  // Common paths for design tokens
  'src/**/*.{css,scss,sass,less}',
  'src/**/*.{js,jsx,ts,tsx}',
  'components/**/*',
  'styles/**/*',
  'theme/**/*',
  'tokens/**/*',
  'design-system/**/*',
  
  // Canon-specific paths (update as needed)
  'canon-theme/**/*',
  'canon-components/**/*',
  'assets/styles/**/*',
],

excludePatterns: [
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
]
```

## 🚀 Running Real Token Scans

### 1. Environment Setup
```bash
# Set GitHub token for private repos
export GITHUB_TOKEN=your_token_here

# Set custom scan output directory (optional)
export SCAN_OUTPUT_PATH=/path/to/scan-reports
```

### 2. Run Full Scan
```bash
# Via API endpoint
curl -X POST http://localhost:5001/api/scans/run \
  -H "Content-Type: application/json" \
  -d '{"type": "full", "repositories": ["all"]}'

# Via frontend dashboard
# Navigate to http://localhost:3001 and click "Run Full Scan"
```

### 3. Run Team-Specific Scan
```bash
curl -X POST http://localhost:5001/api/scans/run \
  -H "Content-Type: application/json" \
  -d '{"type": "team", "team": "Marketing"}'
```

## 📊 Expected Results

After configuring with real repositories, you'll see:

1. **Actual Token Usage**: Real count of design tokens used across Canon projects
2. **Repository Mapping**: Which teams use which tokens
3. **Token Dependencies**: How tokens are interconnected
4. **Coverage Metrics**: Percentage of design system adoption
5. **Usage Trends**: Historical data on token usage changes

## 🔍 Verification Steps

1. **Check Repository Access**: Ensure all configured repos are accessible
2. **Test Token Patterns**: Verify patterns match your actual token usage
3. **Review Scan Results**: Check scan reports in `/backend/scan-reports/`
4. **Monitor Logs**: Watch console output during scanning for errors

## 📝 Common Issues & Solutions

### Issue: Repository Access Denied
**Solution**: Check authentication credentials and repository permissions

### Issue: No Tokens Found
**Solution**: Verify token patterns match your naming conventions

### Issue: Large Repository Timeouts
**Solution**: Add more specific `includePatterns` to reduce scan scope

### Issue: Too Many False Positives
**Solution**: Refine regex patterns to be more specific

## 🔄 Updating Configuration

After making changes to the configuration:

1. Restart the backend server
2. Clear any cached scan results
3. Run a test scan on a single repository first
4. Monitor results and adjust patterns as needed

## 📈 Next Steps

Once real data is flowing:

1. Set up automated daily scans
2. Configure email notifications for token changes
3. Implement approval workflows for design system updates
4. Add custom dashboards for team-specific metrics
