import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'An unexpected error occurred';

  console.error(`[${new Date().toISOString()}] Error ${status}: ${message}`, {
    path: req.path,
    method: req.method,
    stack: error.stack
  });

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};
