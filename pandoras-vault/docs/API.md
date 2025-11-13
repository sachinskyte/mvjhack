# Pandora's Vault API Documentation
#
# Purpose: Complete API reference for the issuer backend
#
# Base URL: https://pandoras-vault-issuer.fly.dev (production)
#           http://localhost:3001 (development)
#
# ============================================================================
# AUTHENTICATION
# ============================================================================
#
# Most endpoints do not require authentication (public issuance).
# Optional: Implement API key authentication for rate limiting bypass.
#
# Header:
# Authorization: Bearer <API_KEY>
#
# ============================================================================
# ENDPOINTS
# ============================================================================
#
# 1. Health Check
# ────────────────────────────────────────────────────────────────────────────
#
# GET /health
#
# Description: Check service health and availability
#
# Request: None
#
# Response:
# {
#   "status": "ok",
#   "timestamp": "2025-01-01T00:00:00.000Z",
#   "services": {
#     "database": "connected",
#     "ipfs": "available",
#     "blockchain": "connected",
#     "veramo": "ready"
#   }
# }
#
# Status Codes:
# - 200: All services healthy
# - 503: One or more services unavailable
#
# ────────────────────────────────────────────────────────────────────────────
#
# 2. Apply for VC
# ────────────────────────────────────────────────────────────────────────────
#
# POST /api/apply
#
# Description: Submit application for Aadhaar Verifiable Credential
#
# Request Body:
# {
#   "aadhaarNumber": "123456789012",      // 12-digit Aadhaar number
#   "name": "John Doe",                   // Full name
#   "dob": "1990-01-01",                  // Date of birth (ISO format)
#   "holderDID": "did:ethr:0x123...",     // User's DID
#   "livenessImage": "data:image/jpeg..." // Base64-encoded image
# }
#
# Validation:
# - aadhaarNumber: Must be 12 digits
# - name: Required, 2-100 characters
# - dob: Valid ISO date, user must be 18+
# - holderDID: Valid DID format
# - livenessImage: Base64 JPEG/PNG, max 5MB
#
# Response (Success - Immediate Issuance):
# {
#   "success": true,
#   "vc": {
#     "@context": [...],
#     "type": ["VerifiableCredential", "AadhaarCredential"],
#     "issuer": "did:ethr:0xISSUER...",
#     "issuanceDate": "2025-01-01T00:00:00Z",
#     "credentialSubject": {
#       "id": "did:ethr:0x123...",
#       "aadhaarNumber": "XXXX-XXXX-9012",
#       "name": "John Doe",
#       "dob": "1990-01-01"
#     },
#     "proof": { ... }
#   },
#   "cid": "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
#   "vcHash": "0xabcdef...",
#   "blockchainTxHash": "0x123456..."
# }
#
# Response (Pending Review):
# {
#   "success": true,
#   "applicationId": "app_abc123",
#   "status": "pending",
#   "message": "Application submitted for review",
#   "estimatedTime": "2-5 minutes"
# }
#
# Response (Error):
# {
#   "error": "Liveness check failed",
#   "code": "LIVENESS_FAILED",
#   "details": {
#     "confidence": 0.45,
#     "threshold": 0.75,
#     "reason": "Face not clearly visible"
#   }
# }
#
# Status Codes:
# - 200: Success
# - 400: Validation error
# - 409: Duplicate application (VC already issued)
# - 429: Rate limit exceeded
# - 500: Internal server error
#
# Rate Limit: 5 requests per hour per IP
#
# ────────────────────────────────────────────────────────────────────────────
#
# 3. Check Application Status
# ────────────────────────────────────────────────────────────────────────────
#
# GET /api/application/:applicationId
#
# Description: Check status of pending application
#
# Request: None (applicationId in URL)
#
# Response (Pending):
# {
#   "applicationId": "app_abc123",
#   "status": "pending",
#   "createdAt": "2025-01-01T00:00:00Z",
#   "message": "Liveness verification in progress"
# }
#
# Response (Approved):
# {
#   "applicationId": "app_abc123",
#   "status": "approved",
#   "vc": { ... },
#   "cid": "QmXXX...",
#   "approvedAt": "2025-01-01T00:05:00Z"
# }
#
# Response (Rejected):
# {
#   "applicationId": "app_abc123",
#   "status": "rejected",
#   "reason": "Liveness check failed",
#   "rejectedAt": "2025-01-01T00:02:00Z"
# }
#
# Status Codes:
# - 200: Success
# - 404: Application not found
#
# ────────────────────────────────────────────────────────────────────────────
#
# 4. Verify Credential
# ────────────────────────────────────────────────────────────────────────────
#
# POST /api/verify
#
# Description: Verify a Verifiable Credential or Presentation
#
# Request Body:
# {
#   "credential": { ... }  // VC or VP object
# }
#
# Response (Valid):
# {
#   "verified": true,
#   "issuer": "did:ethr:0xISSUER...",
#   "subject": "did:ethr:0x123...",
#   "issuanceDate": "2025-01-01T00:00:00Z",
#   "revoked": false,
#   "checks": {
#     "signature": true,
#     "expiration": true,
#     "revocation": true
#   }
# }
#
# Response (Invalid):
# {
#   "verified": false,
#   "reason": "Invalid signature",
#   "checks": {
#     "signature": false,
#     "expiration": true,
#     "revocation": true
#   }
# }
#
# Status Codes:
# - 200: Verification complete (check 'verified' field)
# - 400: Invalid credential format
#
# Rate Limit: 100 requests per hour per IP
#
# ────────────────────────────────────────────────────────────────────────────
#
# 5. Check Revocation Status
# ────────────────────────────────────────────────────────────────────────────
#
# GET /api/revocation/:vcHash
#
# Description: Check if a VC is revoked
#
# Request: None (vcHash in URL)
#
# Response (Not Revoked):
# {
#   "vcHash": "0xabcdef...",
#   "revoked": false
# }
#
# Response (Revoked):
# {
#   "vcHash": "0xabcdef...",
#   "revoked": true,
#   "revokedAt": "2025-01-01T12:00:00Z",
#   "reason": "User requested revocation"
# }
#
# Status Codes:
# - 200: Success
# - 404: VC hash not found
#
# ────────────────────────────────────────────────────────────────────────────
#
# 6. Get Issuer DID
# ────────────────────────────────────────────────────────────────────────────
#
# GET /api/issuer/did
#
# Description: Retrieve issuer's DID and public key
#
# Request: None
#
# Response:
# {
#   "did": "did:ethr:0xISSUER...",
#   "publicKey": "0x04...",
#   "address": "0xISSUER..."
# }
#
# Status Codes:
# - 200: Success
#
# ============================================================================
# ERROR CODES
# ============================================================================
#
# Standard Error Response:
# {
#   "error": "Human-readable error message",
#   "code": "ERROR_CODE",
#   "details": { ... }  // Optional additional info
# }
#
# Error Codes:
# - VALIDATION_ERROR: Input validation failed
# - LIVENESS_FAILED: Liveness check did not pass
# - DUPLICATE_APPLICATION: VC already issued for this Aadhaar
# - RATE_LIMIT_EXCEEDED: Too many requests
# - DATABASE_ERROR: Database operation failed
# - IPFS_ERROR: IPFS upload failed
# - BLOCKCHAIN_ERROR: Blockchain transaction failed
# - INTERNAL_ERROR: Unexpected server error
#
# ============================================================================
# RATE LIMITING
# ============================================================================
#
# Limits per IP address:
# - /api/apply: 5 requests/hour
# - /api/verify: 100 requests/hour
# - Other endpoints: 1000 requests/hour
#
# Headers in Response:
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4
# X-RateLimit-Reset: 1640995200
#
# When rate limited (429 response):
# {
#   "error": "Rate limit exceeded",
#   "code": "RATE_LIMIT_EXCEEDED",
#   "retryAfter": 3600  // Seconds until reset
# }
#
# ============================================================================
# WEBHOOKS (Future Feature)
# ============================================================================
#
# Configure webhook URL to receive events:
# - VC issued
# - VC revoked
# - Application status changed
#
# Webhook Payload:
# {
#   "event": "vc.issued",
#   "timestamp": "2025-01-01T00:00:00Z",
#   "data": {
#     "vcHash": "0xabcdef...",
#     "holderDID": "did:ethr:0x123...",
#     "cid": "QmXXX..."
#   }
# }
#
# ============================================================================
# SDK / CLIENT LIBRARIES
# ============================================================================
#
# Official SDKs:
# - JavaScript/TypeScript: @pandoras-vault/client
# - React Native: @pandoras-vault/mobile-sdk
# - Python: pandoras-vault-py (planned)
#
# Example Usage (JavaScript):
# ```javascript
# import { PandorasVaultClient } from '@pandoras-vault/client';
#
# const client = new PandorasVaultClient({
#   apiUrl: 'https://pandoras-vault-issuer.fly.dev'
# });
#
# const result = await client.apply({
#   aadhaarNumber: '123456789012',
#   name: 'John Doe',
#   dob: '1990-01-01',
#   holderDID: 'did:ethr:0x123...',
#   livenessImage: base64Image
# });
#
# console.log(result.vc);
# ```
#
# ============================================================================
# TESTING
# ============================================================================
#
# Test Endpoint: https://pandoras-vault-issuer-test.fly.dev (testnet)
#
# Test Credentials:
# - Use any 12-digit Aadhaar number (not validated in test mode)
# - Liveness check always passes in test mode
# - VCs issued on Mumbai testnet
#
# Test DIDs:
# - did:ethr:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (test issuer)
#
# Postman Collection: Available at docs/postman_collection.json
#
# ============================================================================
# SUPPORT
# ============================================================================
#
# Documentation: https://docs.pandoras-vault.example.com
# Status Page: https://status.pandoras-vault.example.com
# Email: support@pandoras-vault.example.com
# Discord: https://discord.gg/pandoras-vault
