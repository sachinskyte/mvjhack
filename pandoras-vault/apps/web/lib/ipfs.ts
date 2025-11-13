/**
 * IPFS Library for Web
 * 
 * Purpose: IPFS operations in browser context
 * 
 * Contains:
 * - Pinata/web3.storage API client for browser
 * - Upload files from browser
 * - Fetch from IPFS gateways
 * - CORS-compatible requests
 * 
 * Functions:
 * - uploadToIPFS(file): Upload from browser
 * - fetchFromIPFS(cid): Retrieve via gateway
 * - getPublicURL(cid): Generate public gateway URL
 * 
 * Configuration:
 * - API keys from environment variables
 * - Gateway fallback list
 * - CORS proxies if needed
 * 
 * Uses:
 * - Pinata SDK or web3.storage/w3up-client
 * - fetch API for gateway requests
 */
