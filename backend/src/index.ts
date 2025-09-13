import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import path from 'path';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import routes from './routes';
import { WebSocketService, wsService } from './websocket/WebSocketService';
import { initializeDatabase } from './database';
import { initializeRedis } from './cache/redis';
import { startScheduledTasks } from './scheduler';
import { emailService } from './services/EmailService';
import { designSystemScanService } from './services/DesignSystemScanService';

dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for React app
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3000"
];

// Add Railway production domain if available
if (process.env.RAILWAY_STATIC_URL) {
  allowedOrigins.push(process.env.RAILWAY_STATIC_URL);
}
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push('https://*.railway.app');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"]
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendBuildPath));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api', routes);

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Skip if it's an API route
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'NOT_FOUND', 
          message: 'API route not found' 
        } 
      });
    }
    
    const frontendBuildPath = path.join(__dirname, '../../frontend/build');
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ 
      success: false, 
      error: { 
        code: 'NOT_FOUND', 
        message: 'Route not found' 
      } 
    });
  });
}

// Error handling
app.use(errorHandler);

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis connected');

    // Initialize email service from environment variables
    try {
      await emailService.initialize();
      console.log('✅ Email service initialized');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️ Email service failed to initialize:', errorMessage);
    }

    // Initialize design system scan service
    try {
      console.log('🔍 Testing git-based change detection...');
      const recentChanges = await designSystemScanService.getRecentChanges(24);
      console.log(`✅ Design system scan service ready - found ${recentChanges.commits.length} recent commits`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('⚠️ Design system scan service failed to initialize:', errorMessage);
    }

    // Setup WebSocket
    const webSocketService = new WebSocketService(server);
    console.log('✅ WebSocket configured');

    // Start scheduled tasks
    startScheduledTasks();
    console.log('✅ Scheduled tasks started');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Dashboard API: http://localhost:${PORT}/api`);
      console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

startServer();
