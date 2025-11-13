/**
 * Credential Type Definitions
 * 
 * Purpose: TypeScript interfaces for verifiable credentials
 * 
 * Contains:
 * - VerifiableCredential interface
 * - AadhaarCredential interface
 * - CredentialSubject interface
 * - Proof interface
 * - Context definitions
 * 
 * Interfaces:
 * 
 * VerifiableCredential:
 * - @context: string[]
 * - type: string[]
 * - issuer: string (DID)
 * - issuanceDate: string (ISO)
 * - expirationDate?: string (ISO)
 * - credentialSubject: CredentialSubject
 * - proof: Proof
 * 
 * AadhaarCredential extends VerifiableCredential:
 * - credentialSubject: AadhaarCredentialSubject
 * 
 * AadhaarCredentialSubject:
 * - id: string (holder DID)
 * - aadhaarNumber?: string (optional, for selective disclosure)
 * - name: string
 * - dob: string
 * - address?: string
 * - photoHash?: string
 * 
 * Proof:
 * - type: string (JwtProof2020, EcdsaSecp256k1Signature2019, etc.)
 * - created: string
 * - verificationMethod: string
 * - proofPurpose: string
 * - jws?: string (for JWT)
 * - proofValue?: string
 * 
 * Uses:
 * - TypeScript
 * - Aligned with W3C VC Data Model
 */
