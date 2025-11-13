# Deploy Smart Contracts Script
#
# Purpose: Bash script to deploy contracts to various networks
#
# Contains:
# - Network selection logic
# - Contract compilation
# - Deployment execution
# - Address extraction and saving
# - Verification trigger
#
# Usage:
# ./scripts/deploy-contracts.sh <network>
# Example: ./scripts/deploy-contracts.sh mumbai
#
# Networks supported:
# - localhost: Local Hardhat network
# - mumbai: Polygon testnet
# - polygon: Polygon mainnet
# - base-goerli: Base testnet
# - base: Base mainnet
#
# Script flow:
# 1. Check network argument
# 2. Compile contracts: npx hardhat compile
# 3. Run deployment script: npx hardhat run scripts/deploy.ts --network $NETWORK
# 4. Save deployment addresses to deployments/$NETWORK.json
# 5. Verify contracts: npx hardhat run scripts/verify.ts --network $NETWORK
# 6. Display success message with addresses
#
# Environment variables required:
# - PRIVATE_KEY: Deployer private key
# - ALCHEMY_API_KEY or INFURA_API_KEY
# - POLYGONSCAN_API_KEY (for verification)
#
# Output:
# - deployments/{network}.json
# - Console logs with contract addresses
# - Verification links
#
# Error handling:
# - Check if .env exists
# - Validate network argument
# - Handle compilation failures
# - Handle deployment failures
