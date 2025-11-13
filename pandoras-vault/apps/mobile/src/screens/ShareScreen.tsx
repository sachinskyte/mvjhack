/**
 * Share Screen
 * 
 * Purpose: Create and share selective disclosure proof
 * 
 * Contains:
 * - Selected credential display
 * - Checkboxes for fields to reveal (selective disclosure)
 * - QR code generation for presentation
 * - Deep link generation for mobile-to-mobile sharing
 * - Verifier DID input (optional)
 * - Proof preview
 * - Share button (generates QR/link)
 * 
 * Flow:
 * 1. User selects which fields to share
 * 2. Creates a verifiable presentation (VP)
 * 3. Generates zero-knowledge proof (optional)
 * 4. Encrypts for specific verifier (optional)
 * 5. Displays QR code with VP
 * 6. Logs share event on blockchain
 * 
 * State:
 * - Selected fields
 * - Generated VP
 * - QR code data
 */
