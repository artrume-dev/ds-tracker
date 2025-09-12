#!/bin/bash

# Canon Design System Token Tracker - Environment Setup Script
# This script helps configure authentication and environment variables

echo "🔧 Setting up Canon Design System Token Tracker environment..."

# Create .env file for backend
cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ds_tracker"

# GitHub Authentication (for private repositories)
# Get your token from: https://github.com/settings/tokens
GITHUB_TOKEN=your_github_token_here

# Scanner Configuration
SCAN_OUTPUT_PATH=./scan-reports
TEMP_REPOS_PATH=./temp/repos

# API Configuration
API_PORT=5001
API_HOST=localhost

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# Email Configuration (for notifications)
SMTP_HOST=smtp.canon.com
SMTP_PORT=587
SMTP_USER=your_email@canon.com
SMTP_PASS=your_email_password

# Canon-specific Configuration
CANON_REPOSITORIES='[
  {
    "url": "https://github.com/canon/canon-design-system",
    "name": "canon-design-system",
    "team": "Design System",
    "type": "website",
    "branch": "main"
  },
  {
    "url": "https://github.com/canon/marketing-website", 
    "name": "marketing-website",
    "team": "Marketing",
    "type": "website",
    "branch": "main"
  }
]'
EOF

# Create .env file for frontend
cat > frontend/.env << 'EOF'
# Frontend Configuration
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_WS_URL=ws://localhost:5001
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_REAL_TIME=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_APPROVAL_WORKFLOW=true
EOF

echo "✅ Environment files created!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with your actual GitHub token"
echo "2. Update repository URLs in CANON_REPOSITORIES"
echo "3. Configure your database connection"
echo "4. Update SMTP settings for email notifications"
echo ""
echo "🔑 To get a GitHub token:"
echo "1. Go to https://github.com/settings/tokens"
echo "2. Generate a new token with 'repo' permissions"
echo "3. Copy the token and update GITHUB_TOKEN in backend/.env"
echo ""
echo "🗄️ Database setup:"
echo "1. Install PostgreSQL"
echo "2. Create database: createdb ds_tracker"
echo "3. Update DATABASE_URL in backend/.env"
echo "4. Run: cd backend && npm run db:push"
echo ""

# Make script executable
chmod +x setup-canon.sh

echo "🚀 Run 'npm run dev' to start both servers"
