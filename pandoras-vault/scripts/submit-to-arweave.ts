/**
 * Submit to Arweave Script
 * 
 * Purpose: Permanently archive VCs on Arweave blockchain
 * 
 * Contains:
 * - Arweave SDK initialization
 * - Wallet loading from JWK file
 * - Transaction creation and signing
 * - File upload to Arweave
 * - Transaction ID tracking
 * 
 * Functions:
 * - loadWallet(): Load Arweave wallet from keyfile
 * - uploadToArweave(data, tags): Upload data with metadata tags
 * - checkBalance(): Verify wallet has sufficient AR tokens
 * - getTransactionStatus(txId): Check upload confirmation
 * - saveTransactionId(txId, metadata): Track uploads
 * 
 * Usage:
 * - ts-node scripts/submit-to-arweave.ts <file_path>
 * - Example: ts-node scripts/submit-to-arweave.ts ./vc.json
 * 
 * Flow:
 * 1. Load Arweave wallet
 * 2. Check AR balance
 * 3. Read file to upload
 * 4. Create transaction with tags
 * 5. Sign transaction
 * 6. Upload to Arweave network
 * 7. Wait for confirmation
 * 8. Display transaction ID and URL
 * 
 * Tags (metadata):
 * - Content-Type: application/json
 * - App-Name: Pandoras-Vault
 * - App-Version: 1.0.0
 * - Type: VerifiableCredential
 * - Schema: AadhaarCredential
 * - Timestamp: Unix timestamp
 * 
 * Environment variables:
 * - ARWEAVE_KEYFILE: Path to Arweave wallet JWK
 * 
 * Output:
 * - Transaction ID
 * - Arweave URL: https://arweave.net/{txId}
 * - ViewBlock URL: https://viewblock.io/arweave/tx/{txId}
 * - Confirmation status
 * 
 * Uses:
 * - arweave SDK
 * - fs for file reading
 * - dotenv for configuration
 * 
 * Note:
 * - Arweave uploads cost AR tokens
 * - Ensure wallet is funded
 * - Confirmations may take 10-15 minutes
 */
