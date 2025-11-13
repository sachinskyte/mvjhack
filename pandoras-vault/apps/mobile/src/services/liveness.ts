/**
 * Liveness Service
 * 
 * Purpose: Facial liveness detection and anti-spoofing
 * 
 * Contains:
 * - Upload image to liveness API (issuer backend)
 * - Parse liveness results
 * - Challenge generation (blink, smile, turn)
 * - Image preprocessing (crop, compress, format)
 * - Retry logic for failed checks
 * 
 * Functions:
 * - checkLiveness(imageBase64): Submit image, get liveness score
 * - generateChallenge(): Random challenge for user
 * - validateChallenge(image, challenge): Verify challenge completion
 * - preprocessImage(uri): Prepare image for upload
 * 
 * API Integration:
 * - POST to /api/liveness/check
 * - Response: { isLive: boolean, confidence: number, errors?: string[] }
 * 
 * Uses:
 * - axios for API calls
 * - expo-image-manipulator for preprocessing
 * 
 * Note: Actual liveness detection happens on issuer backend
 */
