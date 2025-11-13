/**
 * Next.js Configuration
 * 
 * Purpose: Configuration for Next.js application
 * 
 * Contains:
 * - Webpack configuration overrides
 * - Environment variable exposure
 * - Image optimization settings
 * - API route configuration
 * - Build output settings
 * - Polyfills for Node.js modules in browser
 * 
 * Settings:
 * - reactStrictMode: true
 * - swcMinify: true (for faster builds)
 * - images: { domains: [...IPFS gateways] }
 * - webpack: Polyfills for crypto, stream, etc.
 * - env: Expose public env vars
 * 
 * Webpack Polyfills Needed:
 * - crypto, stream, buffer for Veramo in browser
 * - Fallback to empty modules for Node-only packages
 * 
 * Uses:
 * - next.config.js standard format
 */
