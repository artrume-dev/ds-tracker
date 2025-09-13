# Railway Deployment Guide for DS-TRACKER

## Required Environment Variables

Set these in your Railway project settings:

### Database
```
DATABASE_URL=<Railway PostgreSQL connection string>
```

### JWT & Security
```
JWT_SECRET=<generate a secure random string>
NODE_ENV=production
```

### Server Configuration  
```
PORT=<Railway will set this automatically>
FRONTEND_URL=<your Railway app URL, e.g., https://your-app.railway.app>
```

### Optional Services (can be configured later)
```
# Redis (for caching) - Add Railway Redis service
REDIS_URL=<Railway Redis connection string>

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-app-password>

# GitHub integration
GITHUB_TOKEN=<your-github-token>

# Slack notifications  
SLACK_WEBHOOK_URL=<your-slack-webhook-url>
```

## Deployment Steps

1. **Create Railway Project**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   - In Railway dashboard, add PostgreSQL service
   - Copy the DATABASE_URL to environment variables

3. **Set Environment Variables**
   - Go to your Railway project settings
   - Add all required environment variables above

4. **Deploy**
   ```bash
   railway up
   ```

5. **Monitor Deployment**
   - Check Railway logs for any issues
   - Visit your app URL once deployed
   - Health check available at: `https://your-app.railway.app/health`

## Notes

- The app automatically runs database migrations on startup
- Frontend is built and served by the backend in production
- Redis is optional - app will use mock mode if not configured
- Email service is optional - app will use mock mode if not configured
