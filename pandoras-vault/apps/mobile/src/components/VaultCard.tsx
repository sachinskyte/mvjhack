/**
 * Vault Card Component
 * 
 * Purpose: Display a single verifiable credential in the vault
 * 
 * Contains:
 * - VC preview with issuer info
 * - Credential type badge (Aadhaar, KYC, etc.)
 * - Issue/expiry dates
 * - Status indicator (valid, expired, revoked)
 * - Share button
 * - View details action
 * - Visual design mimicking physical credential card
 * 
 * Props:
 * - credential: VC object
 * - onShare: Callback to initiate sharing flow
 * - onViewDetails: Expand full credential details
 * 
 * Displays:
 * - Masked sensitive data (last 4 digits)
 * - IPFS/blockchain verification status
 */
