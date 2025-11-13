/**
 * DID Utilities
 * 
 * Purpose: Helper functions for DID operations
 * 
 * Contains:
 * - DID formatting and validation
 * - DID resolution helpers
 * - DID document parsing
 * - Key extraction from DID documents
 * 
 * Functions:
 * - formatDID(publicKey): Create did:ethr or did:key
 * - validateDID(did): Check DID format validity
 * - resolveDID(did): Fetch DID document
 * - extractPublicKey(didDocument): Get verification key
 * - truncateDID(did): Display shortened version
 * - compareDIDs(did1, did2): Check equality
 * 
 * DID Methods Supported:
 * - did:ethr (Ethereum-based)
 * - did:key (public key-based)
 * - did:web (optional, for web identities)
 * 
 * Uses:
 * - Veramo DID resolver
 * - Regular expressions for validation
 */
