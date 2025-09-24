"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const WebSocketService_1 = require("./websocket/WebSocketService");
const database_1 = require("./database");
const redis_1 = require("./cache/redis");
const scheduler_1 = require("./scheduler");
const EmailService_1 = require("./services/EmailService");
const DesignSystemScanService_1 = require("./services/DesignSystemScanService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001
// Middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"]
}));
app.use((0, morgan_1.default)(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path_1.default.join(__dirname, '../../frontend/build');
    app.use(express_1.default.static(frontendBuildPath));
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
app.use('/api', routes_1.default);
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
        const frontendBuildPath = path_1.default.join(__dirname, '../../frontend/build');
        res.sendFile(path_1.default.join(frontendBuildPath, 'index.html'));
    });
}
else {
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
app.use(errorHandler_1.errorHandler);
// Initialize services and start server
async function startServer() {
    try {
        // Initialize database
        await (0, database_1.initializeDatabase)();
        console.log('✅ Database initialized');
        // Initialize Redis
        await (0, redis_1.initializeRedis)();
        console.log('✅ Redis connected');
        // Initialize email service from environment variables
        try {
            await EmailService_1.emailService.initialize();
            console.log('✅ Email service initialized');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log('⚠️ Email service failed to initialize:', errorMessage);
        }
        // Initialize design system scan service
        try {
            console.log('🔍 Testing git-based change detection...');
            const recentChanges = await DesignSystemScanService_1.designSystemScanService.getRecentChanges(24);
            console.log(`✅ Design system scan service ready - found ${recentChanges.commits.length} recent commits`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log('⚠️ Design system scan service failed to initialize:', errorMessage);
        }
        // Setup WebSocket
        const webSocketService = new WebSocketService_1.WebSocketService(server);
        console.log('✅ WebSocket configured');
        // Start scheduled tasks
        (0, scheduler_1.startScheduledTasks)();
        console.log('✅ Scheduled tasks started');
        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Dashboard API: http://localhost:${PORT}/api`);
            console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
        });
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map