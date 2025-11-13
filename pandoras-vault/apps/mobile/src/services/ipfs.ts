/**
 * IPFS Service
 * 
 * Purpose: Upload and retrieve credentials from IPFS
 * 
 * Contains:
 * - Pinata API integration (or web3.storage)
 * - Upload encrypted VC to IPFS
 * - Retrieve VC by CID
 * - Pin management
 * - IPFS gateway fallback handling
 * 
 * Functions:
 * - uploadCredential(vc): Upload VC, returns CID
 * - getCredential(cid): Fetch VC from IPFS
 * - pinToIPFS(data): Pin arbitrary data
 * - unpinFromIPFS(cid): Remove pin
 * - checkPinStatus(cid): Verify pin exists
 * 
 * Configuration:
 * - API keys from .env
 * - Gateway URLs
 * - Timeout settings
 * - Retry logic for failed uploads
 * 
 * Uses:
 * - axios for HTTP requests
 * - Pinata SDK or web3.storage client
 */
