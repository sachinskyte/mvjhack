/**
 * Issue VC Service
 * 
 * Purpose: Create and sign verifiable credentials
 * 
 * Contains:
 * - VC creation with Veramo
 * - Credential formatting (JSON-LD)
 * - Issuer signature
 * - IPFS upload
 * - Blockchain hash submission
 * - VC metadata storage
 * 
 * Functions:
 * - issueAadhaarVC(holderDID, aadhaarData): Create Aadhaar VC
 * - signVC(vc): Sign with issuer's key
 * - uploadVCToIPFS(vc): Upload and pin to IPFS
 * - submitHashToBlockchain(vcHash, cid): Record on-chain
 * - saveVCMetadata(vcHash, cid, holderDID): Store in database
 * 
 * VC Structure:
 * - @context: W3C VC context + Aadhaar schema
 * - type: VerifiableCredential, AadhaarCredential
 * - issuer: Issuer DID
 * - issuanceDate: ISO timestamp
 * - credentialSubject: { id: holderDID, aadhaar: {...} }
 * - proof: JWS signature
 * 
 * Uses:
 * - Veramo issuer agent
 * - IPFS service
 * - Blockchain service
 * - Database service
 */
