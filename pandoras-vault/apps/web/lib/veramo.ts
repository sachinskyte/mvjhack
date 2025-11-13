/**
 * Veramo Library for Web
 * 
 * Purpose: Browser-compatible Veramo agent setup
 * 
 * Contains:
 * - Veramo agent initialization for browser
 * - DID creation and resolution
 * - VC verification functions
 * - VP creation
 * - IndexedDB storage for browser
 * 
 * Functions:
 * - createWebAgent(): Initialize browser agent
 * - verifyCredential(vc): Verify VC signature
 * - createPresentation(vc, holderDID): Generate VP
 * - resolveDID(did): Resolve DID document
 * 
 * Storage:
 * - Uses IndexedDB via Veramo's browser storage
 * - Session-based or persistent based on user choice
 * 
 * Uses:
 * - @veramo/core, @veramo/did-resolver
 * - Browser crypto APIs
 */
