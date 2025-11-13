/**
 * Wallet Agent
 * 
 * Purpose: Initialize and configure the Veramo agent for the mobile wallet
 * 
 * Contains:
 * - Veramo agent setup with DID management capabilities
 * - Key management store (encrypted local storage)
 * - DID resolver configuration
 * - Credential plugin for VC operations (sign, verify, store)
 * - Data store for DIDs and VCs (React Native async storage)
 * 
 * Functions:
 * - createWalletAgent(): Initialize the agent instance
 * - getDID(): Get or create user's DID
 * - storeCredential(): Save received VC to local storage
 * - getCredentials(): Retrieve all stored VCs
 */
