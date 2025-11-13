/**
 * Issuer Agent
 * 
 * Purpose: Veramo agent for the issuer backend
 * 
 * Contains:
 * - Veramo agent initialization for server
 * - Issuer DID creation and management
 * - VC signing capabilities
 * - Key management (server-side secure storage)
 * - DID resolution
 * 
 * Functions:
 * - createIssuerAgent(): Initialize issuer agent
 * - getIssuerDID(): Return issuer's DID
 * - issueCredential(subjectDID, claims): Create and sign VC
 * - revokeCredential(vcHash): Mark VC as revoked
 * 
 * Configuration:
 * - Issuer private key from environment
 * - Database connection for VC storage
 * - DID method (did:ethr with issuer's key)
 * 
 * Uses:
 * - @veramo/core, @veramo/credential-w3c
 * - Database store (PostgreSQL/SQLite)
 */
