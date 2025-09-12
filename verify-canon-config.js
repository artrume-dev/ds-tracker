#!/usr/bin/env node

/**
 * Canon Token Tracker - Configuration Verification Script
 * Run this to test your Canon repositories and token patterns
 */

const fs = require('fs').promises;
const path = require('path');

async function verifyCanonConfig() {
  console.log('🔍 Verifying Canon Design System configuration...\n');

  try {
    // Check if Canon config file exists
    const canonConfigPath = path.join(__dirname, 'backend/src/scanner/canon-config.ts');
    await fs.access(canonConfigPath);
    console.log('✅ Canon configuration file found');

    // Read and parse config
    const configContent = await fs.readFile(canonConfigPath, 'utf-8');
    
    // Extract repository URLs
    const repoMatches = configContent.match(/url:\s*['"]([^'"]+)['"]/g);
    if (repoMatches) {
      console.log('\n📂 Configured repositories:');
      repoMatches.forEach((match, index) => {
        const url = match.match(/['"]([^'"]+)['"]/)[1];
        console.log(`   ${index + 1}. ${url}`);
      });
    }

    // Check for GitHub token
    const envPath = path.join(__dirname, 'backend/.env');
    try {
      const envContent = await fs.readFile(envPath, 'utf-8');
      const hasGithubToken = envContent.includes('GITHUB_TOKEN=') && 
                            !envContent.includes('GITHUB_TOKEN=your_github_token_here');
      
      console.log(`\n🔑 GitHub token configured: ${hasGithubToken ? '✅' : '❌'}`);
      
      if (!hasGithubToken) {
        console.log('   ⚠️  Update GITHUB_TOKEN in backend/.env for private repositories');
      }
    } catch (error) {
      console.log('\n❌ No .env file found. Run ./setup-canon.sh first');
    }

    // Check token patterns
    const patternMatches = configContent.match(/pattern:\s*\/[^\/]+\/g/g);
    if (patternMatches) {
      console.log(`\n🔤 Token patterns configured: ${patternMatches.length} patterns`);
    }

    console.log('\n🚀 To start scanning with Canon repositories:');
    console.log('   1. Update repository URLs in backend/src/scanner/canon-config.ts');
    console.log('   2. Set your GitHub token in backend/.env');
    console.log('   3. Run: npm run dev');
    console.log('   4. Navigate to http://localhost:3001');
    console.log('   5. Click "Run Full Scan" to scan your repositories');

  } catch (error) {
    console.error('❌ Error verifying configuration:', error.message);
    console.log('\n💡 Make sure you have run the setup script:');
    console.log('   chmod +x setup-canon.sh && ./setup-canon.sh');
  }
}

// Test repository accessibility
async function testRepositoryAccess(repoUrl) {
  const { exec } = require('child_process');
  const util = require('util');
  const execAsync = util.promisify(exec);

  try {
    // Test if we can access the repository
    await execAsync(`git ls-remote ${repoUrl} HEAD`);
    return true;
  } catch (error) {
    return false;
  }
}

async function quickTest() {
  console.log('\n🧪 Quick repository access test...');
  
  // Test a few common Canon repository patterns
  const testRepos = [
    '/Users/samarmustafa/Documents/Samar/ssd-dev/canon-design-system',
    '/Users/samarmustafa/Documents/Samar/ssd-dev/marketing-website',
  ];

  for (const repo of testRepos) {
    const accessible = await testRepositoryAccess(repo);
    console.log(`   ${accessible ? '✅' : '❌'} ${repo}`);
    
    if (!accessible) {
      console.log(`      ⚠️  Check if repository exists and is accessible`);
    }
  }
}

// Run verification
verifyCanonConfig().then(() => {
  // Uncomment the line below to test repository access
  // return quickTest();
}).catch(console.error);
