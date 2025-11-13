/**
 * Contract Deployment Script
 * 
 * Purpose: Deploy smart contracts to blockchain
 * 
 * Contains:
 * - Contract compilation check
 * - Deployment sequence
 * - Contract initialization
 * - Address saving to file
 * - Verification preparation
 * 
 * Deployment Order:
 * 1. AccessControl
 * 2. DIDRegistry
 * 3. VCCatalog (with AccessControl address)
 * 
 * Functions:
 * - main(): Orchestrate deployment
 * - deployAccessControl(): Deploy AccessControl contract
 * - deployDIDRegistry(): Deploy DIDRegistry contract
 * - deployVCCatalog(accessControlAddr): Deploy VCCatalog contract
 * - saveDeploymentInfo(addresses, network): Save to JSON file
 * 
 * Post-Deployment:
 * - Grant ISSUER_ROLE to issuer backend address
 * - Grant ADMIN_ROLE to deployer
 * - Save contract addresses to .env or deployments.json
 * 
 * Output:
 * - deployments/{network}.json with contract addresses
 * - Console logs with transaction hashes
 * 
 * Uses:
 * - Hardhat ethers
 * - fs module for file writing
 */
