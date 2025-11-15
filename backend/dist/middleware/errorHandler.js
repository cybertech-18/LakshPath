"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    const appError = err instanceof AppError ? err : new AppError(err.message || 'Internal Server Error');
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error handler caught:', err);
    }
    res.status(appError.statusCode).json({
        error: appError.message,
        details: appError.details,
    });
};
exports.errorHandler = errorHandler;
