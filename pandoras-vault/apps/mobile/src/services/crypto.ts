/**
 * Crypto Service
 * 
 * Purpose: Cryptographic operations for wallet security
 * 
 * Contains:
 * - Key generation (secp256k1 for DIDs)
 * - Encryption/decryption (AES-256-GCM for local storage)
 * - Hashing functions (SHA-256, keccak256)
 * - Signature creation and verification
 * - Secure random number generation
 * - Key derivation (PBKDF2 for password-based keys)
 * 
 * Functions:
 * - generateKeyPair(): Create new DID keypair
 * - encryptData(data, password): Encrypt sensitive data
 * - decryptData(encrypted, password): Decrypt data
 * - hashCredential(vc): Generate VC hash for blockchain
 * - signData(data, privateKey): Create signature
 * - verifySignature(data, signature, publicKey): Verify signature
 * 
 * Uses:
 * - expo-crypto or react-native-crypto
 * - ethers.js for blockchain-compatible signatures
 */
