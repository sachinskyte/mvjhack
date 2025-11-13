/**
 * Liveness Check Component
 * 
 * Purpose: Camera component for facial liveness detection
 * 
 * Contains:
 * - React Native Camera integration
 * - Face detection overlay (guide user positioning)
 * - Capture button and preview
 * - Liveness challenge display (blink, turn head, smile)
 * - Progress indicator for multi-step challenges
 * - Image capture and compression
 * 
 * Props:
 * - onComplete: Callback with captured image data
 * - onCancel: Return to previous screen
 * 
 * Uses:
 * - expo-camera for camera access
 * - expo-face-detector (optional) for guidance
 * - Image compression before upload
 */
