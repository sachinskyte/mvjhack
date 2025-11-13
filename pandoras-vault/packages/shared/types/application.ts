/**
 * Application Type Definitions
 * 
 * Purpose: TypeScript interfaces for VC application flow
 * 
 * Contains:
 * - Application request/response types
 * - Form data interfaces
 * - API request/response types
 * - Status enums
 * 
 * Interfaces:
 * 
 * ApplicationRequest:
 * - aadhaarNumber: string
 * - name: string
 * - dob: string
 * - holderDID: string
 * - livenessImage: string (base64)
 * 
 * ApplicationResponse:
 * - success: boolean
 * - applicationId?: string
 * - vc?: VerifiableCredential
 * - cid?: string
 * - error?: string
 * 
 * ApplicationStatus:
 * - PENDING = 'pending'
 * - LIVENESS_CHECK = 'liveness_check'
 * - APPROVED = 'approved'
 * - REJECTED = 'rejected'
 * - ISSUED = 'issued'
 * 
 * LivenessResult:
 * - isLive: boolean
 * - confidence: number
 * - errors?: string[]
 * - details?: Record<string, any>
 * 
 * VCSubmissionResult:
 * - vcHash: string
 * - cid: string
 * - blockchainTxHash?: string
 * - timestamp: number
 * 
 * Uses:
 * - TypeScript
 * - Shared between mobile, web, and issuer
 */
