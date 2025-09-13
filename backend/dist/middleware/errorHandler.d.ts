import { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    status?: number;
    code?: string;
}
export declare const errorHandler: (error: CustomError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map