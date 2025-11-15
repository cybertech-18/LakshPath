import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const appError = err instanceof AppError ? err : new AppError(err.message || 'Internal Server Error');

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error handler caught:', err);
  }

  res.status(appError.statusCode).json({
    error: appError.message,
    details: appError.details,
  });
};
