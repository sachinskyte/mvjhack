/**
 * Blockchain Service
 * 
 * Purpose: Interact with smart contracts for DID and VC registry
 * 
 * Contains:
 * - ethers.js provider setup (Polygon, Base, etc.)
 * - Contract ABI imports
 * - DID registration on-chain
 * - VC hash submission to VCCatalog
 * - Event listening for VC updates
 * - Gas estimation and transaction signing
 * 
 * Functions:
 * - registerDID(did, publicKey): Register new DID on DIDRegistry
 * - submitVCHash(vcHash, cid): Submit VC hash to blockchain
 * - getVCStatus(vcHash): Check if VC is revoked
 * - listenForEvents(did): Subscribe to DID-related events
 * - estimateGas(txData): Calculate gas for transaction
 * 
 * Contracts:
 * - DIDRegistry: DID management
 * - VCCatalog: VC hash registry
 * - AccessControl: Permission management
 * 
 * Uses:
 * - ethers.js for blockchain interaction
 * - Wallet signer from Veramo agent
 */
