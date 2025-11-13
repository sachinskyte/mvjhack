# Zero-Custody Architecture
#
# Purpose: Explain the zero-custody model of Pandora's Vault
#
# ============================================================================
# OVERVIEW
# ============================================================================
#
# Pandora's Vault implements a true zero-custody model where:
# 1. Users own and control their credentials
# 2. No central authority stores user credentials
# 3. Private keys never leave the user's device
# 4. Issuers cannot access credentials after issuance
# 5. Verifiers only see what users choose to share
#
# This document explains how this is achieved technically.
#
# ============================================================================
# KEY PRINCIPLES
# ============================================================================
#
# 1. Self-Sovereign Identity (SSI)
#    - Users create their own DIDs (Decentralized Identifiers)
#    - DIDs are cryptographic identities (did:ethr, did:key)
#    - Users control the private keys
#    - DIDs are registered on-chain (optional)
#
# 2. Credential Ownership
#    - VCs are issued TO the user's DID
#    - VCs are stored locally on user's device (encrypted)
#    - Optional: User uploads encrypted VC to IPFS
#    - Issuer does NOT store the full VC
#
# 3. Selective Disclosure
#    - Users create Verifiable Presentations (VPs)
#    - VPs can contain subset of VC claims
#    - Users prove ownership via signatures
#    - Verifiers cannot access undisclosed fields
#
# 4. Decentralized Storage
#    - IPFS for credential storage (user-controlled)
#    - Blockchain for VC hash registry (public ledger)
#    - No centralized credential database
#
# ============================================================================
# ARCHITECTURE FLOW
# ============================================================================
#
# ISSUANCE FLOW:
#
# 1. User Creates DID
#    - Mobile app generates keypair (secp256k1)
#    - Creates DID: did:ethr:0x{address}
#    - Stores private key in secure enclave (expo-secure-store)
#    - Optionally registers DID on-chain (DIDRegistry contract)
#
# 2. User Applies for VC
#    - User fills application form
#    - Completes liveness check (photo verification)
#    - Submits to Issuer API with holderDID
#    - Issuer verifies liveness, checks database
#
# 3. Issuer Creates VC
#    - Issuer creates VC with user's DID as subject
#    - VC structure:
#      {
#        "@context": [...],
#        "type": ["VerifiableCredential", "AadhaarCredential"],
#        "issuer": "did:ethr:{issuer}",
#        "issuanceDate": "2025-01-01T00:00:00Z",
#        "credentialSubject": {
#          "id": "did:ethr:{user}",  # User's DID
#          "aadhaarNumber": "XXXX-XXXX-1234",
#          "name": "John Doe",
#          "dob": "1990-01-01"
#        },
#        "proof": {
#          "type": "EcdsaSecp256k1Signature2019",
#          "created": "2025-01-01T00:00:00Z",
#          "verificationMethod": "did:ethr:{issuer}#keys-1",
#          "jws": "eyJhbGciOiJFUzI1NksifQ..."
#        }
#      }
#    - Issuer signs VC with private key (Veramo)
#
# 4. VC Delivery to User
#    - Issuer sends VC to user (API response)
#    - User stores VC locally (encrypted with device key)
#    - User optionally uploads VC to IPFS (encrypted)
#    - Issuer submits VC hash to blockchain (VCCatalog)
#    - Issuer does NOT store full VC (only metadata)
#
# 5. Zero-Custody Guarantee
#    - Issuer backend stores only:
#      * Aadhaar hash (for duplicate prevention)
#      * VC hash (for revocation checking)
#      * IPFS CID (for reference)
#      * Application metadata
#    - Issuer CANNOT reconstruct the VC
#    - Issuer CANNOT access VC claims
#    - User is the sole custodian
#
# ============================================================================
# VERIFICATION FLOW
# ============================================================================
#
# 1. User Initiates Sharing
#    - User selects VC to share
#    - User chooses fields to reveal (selective disclosure)
#    - Example: Prove age > 18 without revealing DOB
#
# 2. User Creates Verifiable Presentation
#    - Mobile app creates VP with selected claims
#    - VP structure:
#      {
#        "@context": [...],
#        "type": "VerifiablePresentation",
#        "verifiableCredential": {
#          # Redacted VC with only selected fields
#          "credentialSubject": {
#            "id": "did:ethr:{user}",
#            "name": "John Doe"  # Only name revealed
#            # aadhaarNumber and dob omitted
#          }
#        },
#        "proof": {
#          # User signs VP with their private key
#          "type": "EcdsaSecp256k1Signature2019",
#          "verificationMethod": "did:ethr:{user}#keys-1",
#          "challenge": "{verifier_challenge}",
#          "jws": "..."
#        }
#      }
#    - User signs VP with their DID's private key
#
# 3. VP Delivery
#    - VP displayed as QR code
#    - Verifier scans QR code
#    - VP transmitted over secure channel
#
# 4. Verifier Validates VP
#    - Verifies user's signature on VP (proves ownership)
#    - Verifies issuer's signature on VC (proves authenticity)
#    - Checks VC not revoked (queries blockchain)
#    - Resolves DIDs to verify public keys
#    - Checks VC expiration (if applicable)
#
# 5. Zero-Knowledge Proofs (Advanced)
#    - User can prove predicates without revealing data
#    - Example: Prove age > 18 without revealing DOB
#    - Uses zk-SNARKs (circom/snarkjs)
#    - Verifier receives proof, not actual data
#
# ============================================================================
# DATA STORAGE BREAKDOWN
# ============================================================================
#
# USER DEVICE (Mobile Wallet):
# - Private key (encrypted in secure enclave)
# - Full VCs (encrypted in AsyncStorage)
# - DIDs (local database)
# - Application state
#
# ISSUER BACKEND DATABASE:
# - Aadhaar hash (SHA-256, salted)
# - VC hash (keccak256 for blockchain)
# - IPFS CID (reference to encrypted VC)
# - Application status
# - Metadata: timestamps, holderDID
# - NO full VC content
# - NO plain text Aadhaar
# - NO private keys
#
# BLOCKCHAIN (Immutable Ledger):
# - DID registrations (DIDRegistry contract)
# - VC hashes (VCCatalog contract)
# - Revocation status
# - Issuer addresses
# - Timestamps
# - NO VC claims or PII
#
# IPFS (Decentralized Storage):
# - Encrypted VCs (user-controlled)
# - CIDs stored on-chain
# - User can pin on their own IPFS node
# - User can unpin (remove from storage)
# - Optional: Encrypt with verifier's public key
#
# ============================================================================
# SECURITY GUARANTEES
# ============================================================================
#
# 1. Issuer Compromise
#    - If issuer backend is hacked:
#      * Attackers get: VC hashes, CIDs, metadata
#      * Attackers CANNOT: Read VC claims, forge VCs
#    - Existing VCs remain valid (issuer signature unchanged)
#    - Revoke issuer's keys, deploy new issuer
#
# 2. IPFS Node Compromise
#    - If IPFS node is compromised:
#      * Attackers get: Encrypted VCs
#      * Attackers CANNOT: Decrypt without user's key
#    - User can re-encrypt and re-upload
#
# 3. Blockchain Transparency
#    - VC hashes are public (for verification)
#    - Hashes do NOT reveal VC content (one-way function)
#    - Blockchain acts as public registry, not data store
#
# 4. User Device Loss
#    - User loses phone: VCs are encrypted
#    - Backup options:
#      a) Seed phrase (12/24 words) for key recovery
#      b) Cloud backup (encrypted)
#      c) Re-issuance (requires liveness check again)
#
# 5. Privacy Protection
#    - Minimal PII stored centrally
#    - Aadhaar stored as hash (irreversible)
#    - VCs encrypted before IPFS upload
#    - Selective disclosure prevents over-sharing
#    - Zero-knowledge proofs hide actual data
#
# ============================================================================
# COMPARISON: TRADITIONAL vs ZERO-CUSTODY
# ============================================================================
#
# Traditional KYC Systems:
# - Central database stores user data
# - Single point of failure
# - Data breaches expose millions
# - Users cannot control data usage
# - Third-party access without user knowledge
#
# Pandora's Vault (Zero-Custody):
# - User stores own credentials
# - Decentralized storage (IPFS, blockchain)
# - No single point of failure
# - User explicitly shares each time
# - Cryptographic proof of authenticity
# - Auditable sharing (on-chain logs)
#
# ============================================================================
# REVOCATION MODEL
# ============================================================================
#
# Revocation WITHOUT Compromising Privacy:
#
# 1. Issuer marks VC as revoked
#    - Updates VCCatalog contract: setRevoked(vcHash, reason)
#    - On-chain event emitted
#
# 2. Verifier checks revocation
#    - Queries VCCatalog.isRevoked(vcHash)
#    - If revoked, rejects VP
#
# 3. User awareness
#    - Mobile app listens for revocation events
#    - Notifies user if their VC is revoked
#    - User can request re-issuance
#
# 4. Privacy preserved
#    - Only VC hash is on-chain
#    - No VC claims revealed in revocation
#
# ============================================================================
# COMPLIANCE AND REGULATIONS
# ============================================================================
#
# GDPR (Right to Erasure):
# - User deletes VC from device → data erased
# - User unpins from IPFS → data removed
# - Blockchain hashes remain (but not personal data)
# - Issuer deletes application metadata (if requested)
#
# Data Minimization:
# - Only collect necessary data (Aadhaar, name, DOB)
# - Store hashes instead of plain text
# - User controls data sharing
#
# Audit Trail:
# - Blockchain provides immutable audit log
# - Who issued VC (issuer DID)
# - When issued (timestamp)
# - VC hash for verification
#
# ============================================================================
# FUTURE ENHANCEMENTS
# ============================================================================
#
# 1. Fully Homomorphic Encryption (FHE)
#    - Compute on encrypted data
#    - Verify credentials without decryption
#
# 2. ZK-STARKs for Scalability
#    - Prove multiple credentials in one proof
#    - Reduce on-chain verification cost
#
# 3. Decentralized Issuer Network
#    - Multiple issuers for redundancy
#    - Cross-verification of VCs
#
# 4. Social Recovery
#    - Guardians help recover keys
#    - Shamir's Secret Sharing
#
# 5. Progressive Disclosure
#    - Reveal more data as trust increases
#    - Time-limited VPs
#
# ============================================================================
# CONCLUSION
# ============================================================================
#
# Pandora's Vault achieves true zero-custody by:
# - Giving users cryptographic control (DIDs, private keys)
# - Storing credentials locally (encrypted)
# - Using blockchain for verification, not storage
# - Enabling selective disclosure and ZK proofs
# - Minimizing centralized data retention
#
# Users are the sole custodians of their digital identity.
