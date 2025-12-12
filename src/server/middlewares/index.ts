// Legacy exports for backward compatibility
export { getCorsOrigin, handleCorsOptions, addCorsHeaders } from './cors';
export { checkRateLimit, createRateLimitResponse, type RateLimitResult } from './rateLimit';
export { handleAuthentication, requiresAuth } from './auth';
export { logRequest } from './logging';

// Chain of Responsibility pattern exports
export { BaseMiddleware, type MiddlewareContext, type MiddlewareResult } from './base';
export { CorsMiddleware } from './corsMiddleware';
export { RateLimitMiddleware } from './rateLimitMiddleware';
export { LoggingMiddleware } from './loggingMiddleware';
export { AuthMiddleware } from './authMiddleware';
export { MiddlewareChain } from './chain';