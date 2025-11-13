/**
 * Hash Utilities
 * 
 * Purpose: Cryptographic hashing functions for cross-platform use
 * 
 * Contains:
 * - SHA-256 hashing
 * - Keccak-256 hashing (for blockchain)
 * - VC hash generation
 * - Aadhaar number hashing (privacy-preserving)
 * 
 * Functions:
 * - sha256(data: string | Buffer): string
 *   - Generate SHA-256 hash, returns hex string
 * 
 * - keccak256(data: string | Buffer): string
 *   - Generate Keccak-256 hash for Ethereum compatibility
 *   - Returns hex string with 0x prefix
 * 
 * - hashVC(vc: VerifiableCredential): string
 *   - Generate deterministic hash of VC for blockchain
 *   - Normalizes JSON before hashing
 *   - Returns keccak256 hash
 * 
 * - hashAadhaar(aadhaarNumber: string): string
 *   - Hash Aadhaar number for database lookup
 *   - Adds salt from environment for security
 *   - Returns SHA-256 hash
 * 
 * - normalizeJSON(obj: any): string
 *   - Canonicalize JSON for consistent hashing
 *   - Sorts keys, removes whitespace
 * 
 * Implementation:
 * - Works in Node.js and browser environments
 * - Uses crypto (Node.js) or SubtleCrypto (browser)
 * - ethers.js for keccak256
 * 
 * Uses:
 * - crypto (Node.js built-in)
 * - SubtleCrypto (browser Web Crypto API)
 * - ethers.js utils
 * 
 * Shared by:
 * - Mobile app
 * - Web dashboard
 * - Issuer backend
 */
