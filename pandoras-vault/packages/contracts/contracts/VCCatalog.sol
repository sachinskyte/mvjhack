/**
 * VC Catalog Smart Contract
 * 
 * Purpose: On-chain catalog of verifiable credential hashes
 * 
 * Contains:
 * - VC hash submission
 * - IPFS CID storage
 * - Revocation status tracking
 * - Issuer verification
 * - Access control for updates
 * 
 * Functions:
 * - submitVC(vcHash, cid, holderDID): Submit VC hash to catalog
 * - revokeVC(vcHash, reason): Revoke a credential
 * - isRevoked(vcHash): Check revocation status
 * - getVC(vcHash): Retrieve VC metadata
 * - getVCsByHolder(holderDID): Get all VCs for a DID
 * - getVCsByIssuer(issuerDID): Get all VCs issued by a DID
 * 
 * State Variables:
 * - mapping(bytes32 => VCMetadata) vcCatalog
 * - mapping(bytes32 => bytes32[]) holderVCs (holderDID => vcHashes)
 * - mapping(address => bool) authorizedIssuers
 * 
 * Struct VCMetadata:
 * - vcHash: bytes32
 * - cid: string (IPFS CID)
 * - issuer: address (issuer's address)
 * - holderDID: bytes32
 * - timestamp: uint256
 * - revoked: bool
 * - revocationReason: string
 * 
 * Events:
 * - VCSubmitted(vcHash, issuer, holderDID, cid, timestamp)
 * - VCRevoked(vcHash, reason, timestamp)
 * 
 * Modifiers:
 * - onlyAuthorizedIssuer: Restrict submission to approved issuers
 * 
 * Uses:
 * - Solidity ^0.8.0
 * - AccessControl contract
 */
