/**
 * IPFS Pinning Service
 * 
 * Purpose: Unified IPFS pinning interface for multiple providers
 * 
 * Contains:
 * - Pinata API integration
 * - web3.storage integration
 * - Unified interface for pinning
 * - Provider fallback logic
 * 
 * Functions:
 * - pin(data: any, options?: PinOptions): Promise<PinResult>
 *   - Pin data to IPFS, returns CID
 *   - Tries primary provider, falls back if fails
 *   - Options: { name, metadata }
 * 
 * - unpin(cid: string): Promise<void>
 *   - Remove pin from IPFS service
 * 
 * - checkPinStatus(cid: string): Promise<PinStatus>
 *   - Verify if CID is pinned
 *   - Returns { pinned: boolean, provider: string }
 * 
 * - getPinataClient(): PinataClient
 *   - Get configured Pinata SDK instance
 * 
 * - getWeb3StorageClient(): Web3StorageClient
 *   - Get configured web3.storage client
 * 
 * Types:
 * - PinOptions: { name?: string; metadata?: Record<string, any> }
 * - PinResult: { cid: string; provider: string; size: number }
 * - PinStatus: { pinned: boolean; provider: string; timestamp?: number }
 * 
 * Configuration:
 * - Reads API keys from environment
 * - PINATA_API_KEY, PINATA_SECRET_KEY
 * - WEB3_STORAGE_TOKEN
 * 
 * Uses:
 * - @pinata/sdk or pinata-sdk
 * - @web3-storage/w3up-client
 * - axios for API calls
 * 
 * Used by:
 * - Issuer backend (pin VCs)
 * - Mobile app (optional backup)
 * - Web dashboard (upload/retrieve)
 */
