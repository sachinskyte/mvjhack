/**
 * Hardhat Configuration
 * 
 * Purpose: Configure Hardhat for smart contract development
 * 
 * Contains:
 * - Network configurations (local, testnet, mainnet)
 * - Solidity compiler settings
 * - Plugin configuration
 * - Account management
 * - Gas reporter settings
 * - Etherscan API configuration
 * 
 * Networks:
 * - hardhat: Local development network
 * - localhost: Hardhat node instance
 * - mumbai: Polygon testnet
 * - polygon: Polygon mainnet
 * - base-goerli: Base testnet (optional)
 * - base: Base mainnet (optional)
 * 
 * Compiler:
 * - version: "0.8.20"
 * - optimizer: enabled, runs: 200
 * - evmVersion: "paris"
 * 
 * Plugins:
 * - @nomiclabs/hardhat-ethers
 * - @nomiclabs/hardhat-etherscan
 * - hardhat-gas-reporter
 * - solidity-coverage
 * - @typechain/hardhat
 * 
 * Environment Variables:
 * - PRIVATE_KEY: Deployer private key
 * - ALCHEMY_API_KEY or INFURA_API_KEY
 * - POLYGONSCAN_API_KEY
 * - COINMARKETCAP_API_KEY (for gas reporter)
 * 
 * Uses:
 * - TypeScript configuration
 * - dotenv for environment variables
 */
