import { databaseService } from './service';
export * from './service';
export declare function initDatabase(): Promise<void>;
export declare function closeDatabaseConnection(): Promise<void>;
export { databaseService };
export declare const prisma: {
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
    $queryRaw: (query: any) => Promise<void>;
    teamSubscription: {
        findMany: () => Promise<import("./service").TeamSubscription[]>;
        findUnique: ({ where }: {
            where: {
                teamName: string;
            };
        }) => Promise<import("./service").TeamSubscription | null>;
        create: ({ data }: {
            data: any;
        }) => Promise<void>;
        update: ({ where, data }: {
            where: {
                teamName: string;
            };
            data: any;
        }) => Promise<void>;
        delete: ({ where }: {
            where: {
                teamName: string;
            };
        }) => Promise<void>;
    };
    emailConfig: {
        findFirst: () => Promise<import("./service").EmailConfig | null>;
        upsert: ({ create }: {
            create: any;
        }) => Promise<void>;
    };
    notification: {
        findMany: ({ where }: {
            where: {
                teamName: string;
            };
        }) => Promise<import("./service").Notification[]>;
        create: ({ data }: {
            data: any;
        }) => Promise<void>;
    };
};
export declare function initializeDatabase(): Promise<void>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=index.d.ts.map