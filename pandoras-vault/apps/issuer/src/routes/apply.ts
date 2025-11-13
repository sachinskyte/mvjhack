/**
 * Apply Route
 * 
 * Purpose: API endpoint for VC application submissions
 * 
 * Contains:
 * - POST /api/apply endpoint
 * - Request validation (Aadhaar format, required fields)
 * - Liveness verification integration
 * - Database check (prevent duplicates)
 * - VC issuance trigger
 * - Response with VC or application ID
 * 
 * Request Body:
 * - aadhaarNumber: string (12 digits)
 * - name: string
 * - dob: string (ISO date)
 * - holderDID: string
 * - livenessImage: string (base64)
 * 
 * Response:
 * - Success: { vc: VerifiableCredential, cid: string }
 * - Pending: { applicationId: string, status: 'pending' }
 * - Error: { error: string, code: number }
 * 
 * Flow:
 * 1. Validate input
 * 2. Verify liveness
 * 3. Check database for existing VC
 * 4. Issue VC
 * 5. Upload to IPFS
 * 6. Submit hash to blockchain
 * 7. Return VC to user
 * 
 * Uses:
 * - Fastify route handler
 * - Rate limiting middleware
 */
