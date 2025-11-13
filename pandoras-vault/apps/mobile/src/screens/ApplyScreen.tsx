/**
 * Apply Screen
 * 
 * Purpose: Main screen for applying for a new Aadhaar VC
 * 
 * Contains:
 * - Step-by-step wizard UI
 * - Step 1: Information form (ApplyForm component)
 * - Step 2: Liveness check (LivenessCheck component)
 * - Step 3: Review and submit
 * - Step 4: Processing status
 * - Progress indicator
 * - Navigation between steps
 * 
 * Flow:
 * 1. User fills form
 * 2. Completes liveness check
 * 3. Submits application to issuer API
 * 4. Polls for VC issuance
 * 5. Stores VC locally and on IPFS
 * 6. Navigates to HomeScreen with success message
 * 
 * State:
 * - Current step
 * - Form data
 * - Liveness image
 * - Application status
 */
