/**
 * Health Check Route
 * 
 * Purpose: Health check endpoint for deployment monitoring
 * 
 * Contains:
 * - GET /health endpoint
 * - Service status checks
 * - Database connectivity
 * - IPFS service availability
 * - Blockchain RPC status
 * 
 * Response:
 * - { status: 'ok', timestamp: ISO string, services: {...} }
 * 
 * Services Checked:
 * - database: connected/error
 * - ipfs: available/unavailable
 * - blockchain: connected/error
 * - veramo: ready/error
 * 
 * Uses:
 * - Fastify route handler
 * - No authentication required
 */
