/**
 * Database Check Service
 * 
 * Purpose: Verify Aadhaar against database and prevent duplicates
 * 
 * Contains:
 * - Aadhaar hash lookup (privacy-preserving)
 * - Duplicate VC check
 * - Application status tracking
 * - VC metadata storage
 * 
 * Functions:
 * - checkDuplicate(aadhaarHash): Check if VC already issued
 * - storeApplication(data): Save application to database
 * - getApplicationStatus(id): Retrieve application state
 * - updateApplicationStatus(id, status): Mark as completed/rejected
 * - storeVCMetadata(vcHash, cid, holderDID): Save VC reference
 * 
 * Database Schema (Prisma):
 * - Application: id, aadhaarHash, holderDID, status, createdAt
 * - VCMetadata: vcHash, cid, holderDID, issuedAt, revokedAt
 * 
 * Privacy:
 * - Store SHA-256 hash of Aadhaar, not plain text
 * - Minimal PII retention
 * - Encryption at rest
 * 
 * Uses:
 * - Prisma ORM
 * - PostgreSQL or SQLite
 */
