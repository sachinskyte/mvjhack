/**
 * Rate Limiting Middleware
 * 
 * Purpose: Prevent abuse of API endpoints
 * 
 * Contains:
 * - Rate limiter configuration
 * - IP-based throttling
 * - Endpoint-specific limits
 * - Redis store for distributed systems
 * 
 * Configuration:
 * - /api/apply: 5 requests per hour per IP
 * - /api/verify: 100 requests per hour per IP
 * - /health: Unlimited
 * 
 * Functions:
 * - rateLimitMiddleware(opts): Fastify plugin
 * - customKeyGenerator(req): Use IP or API key
 * 
 * Response on Limit:
 * - 429 Too Many Requests
 * - Retry-After header
 * - { error: 'Rate limit exceeded', retryAfter: seconds }
 * 
 * Uses:
 * - @fastify/rate-limit
 * - Redis (optional, for multi-instance)
 * - In-memory store (development)
 */
