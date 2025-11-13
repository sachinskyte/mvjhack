/**
 * Fastify Server
 * 
 * Purpose: Main server entry point
 * 
 * Contains:
 * - Fastify app initialization
 * - Plugin registration (CORS, helmet, rate limit)
 * - Route registration
 * - Database connection
 * - Error handling
 * - Graceful shutdown
 * 
 * Middleware:
 * - CORS: Allow mobile app origins
 * - Helmet: Security headers
 * - Rate limiting
 * - Request logging (pino)
 * - Body parsing (JSON, multipart)
 * 
 * Routes:
 * - /api/apply (POST)
 * - /api/verify (POST)
 * - /health (GET)
 * 
 * Configuration:
 * - Port from environment (default 3001)
 * - Host: 0.0.0.0 (for containers)
 * - Trust proxy headers
 * 
 * Startup:
 * 1. Initialize database
 * 2. Initialize Veramo agent
 * 3. Test IPFS connection
 * 4. Test blockchain connection
 * 5. Start server
 * 
 * Uses:
 * - Fastify framework
 * - Pino logger
 */
