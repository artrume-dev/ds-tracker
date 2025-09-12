import { databaseService } from './service';

export * from './service';

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) {
    console.log('📊 Database already initialized');
    return;
  }

  try {
    // In-memory database is automatically initialized when imported
    console.log('📊 In-memory database initialized successfully');
    isInitialized = true;
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (isInitialized) {
    // No need to close in-memory database
    isInitialized = false;
    console.log('📊 Database connection closed');
  }
}

export { databaseService };

// For backward compatibility with existing code
export const prisma = {
  $connect: async () => console.log('SQLite database connected'),
  $disconnect: async () => closeDatabaseConnection(),
  $queryRaw: async (query: any) => console.log('SQLite query:', query),
  
  teamSubscription: {
    findMany: () => databaseService.getTeamSubscriptions(),
    findUnique: ({ where }: { where: { teamName: string } }) => 
      databaseService.getTeamSubscription(where.teamName),
    create: ({ data }: { data: any }) => databaseService.saveTeamSubscription(data),
    update: ({ where, data }: { where: { teamName: string }, data: any }) => 
      databaseService.saveTeamSubscription({ ...data, teamName: where.teamName }),
    delete: ({ where }: { where: { teamName: string } }) => 
      databaseService.deleteTeamSubscription(where.teamName)
  },
  emailConfig: {
    findFirst: () => databaseService.getEmailConfig(),
    upsert: ({ create }: { create: any }) => databaseService.saveEmailConfig(create)
  },
  notification: {
    findMany: ({ where }: { where: { teamName: string } }) => 
      databaseService.getNotificationsForTeam(where.teamName),
    create: ({ data }: { data: any }) => databaseService.saveNotification(data)
  }
};

// Legacy function names for backward compatibility
export async function initializeDatabase() {
  return initDatabase();
}

export async function closeDatabase() {
  return closeDatabaseConnection();
}
