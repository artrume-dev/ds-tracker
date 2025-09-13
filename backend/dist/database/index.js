"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.databaseService = void 0;
exports.initDatabase = initDatabase;
exports.closeDatabaseConnection = closeDatabaseConnection;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const service_1 = require("./service");
Object.defineProperty(exports, "databaseService", { enumerable: true, get: function () { return service_1.databaseService; } });
__exportStar(require("./service"), exports);
let isInitialized = false;
async function initDatabase() {
    if (isInitialized) {
        console.log('📊 Database already initialized');
        return;
    }
    try {
        // In-memory database is automatically initialized when imported
        console.log('📊 In-memory database initialized successfully');
        isInitialized = true;
        console.log('✅ Database initialization complete');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}
async function closeDatabaseConnection() {
    if (isInitialized) {
        // No need to close in-memory database
        isInitialized = false;
        console.log('📊 Database connection closed');
    }
}
// For backward compatibility with existing code
exports.prisma = {
    $connect: async () => console.log('SQLite database connected'),
    $disconnect: async () => closeDatabaseConnection(),
    $queryRaw: async (query) => console.log('SQLite query:', query),
    teamSubscription: {
        findMany: () => service_1.databaseService.getTeamSubscriptions(),
        findUnique: ({ where }) => service_1.databaseService.getTeamSubscription(where.teamName),
        create: ({ data }) => service_1.databaseService.saveTeamSubscription(data),
        update: ({ where, data }) => service_1.databaseService.saveTeamSubscription({ ...data, teamName: where.teamName }),
        delete: ({ where }) => service_1.databaseService.deleteTeamSubscription(where.teamName)
    },
    emailConfig: {
        findFirst: () => service_1.databaseService.getEmailConfig(),
        upsert: ({ create }) => service_1.databaseService.saveEmailConfig(create)
    },
    notification: {
        findMany: ({ where }) => service_1.databaseService.getNotificationsForTeam(where.teamName),
        create: ({ data }) => service_1.databaseService.saveNotification(data)
    }
};
// Legacy function names for backward compatibility
async function initializeDatabase() {
    return initDatabase();
}
async function closeDatabase() {
    return closeDatabaseConnection();
}
//# sourceMappingURL=index.js.map