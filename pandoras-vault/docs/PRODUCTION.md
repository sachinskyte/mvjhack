# Production Deployment Guide
#
# Purpose: Complete guide for deploying Pandora's Vault to production
#
# Table of Contents:
# 1. Prerequisites
# 2. Smart Contract Deployment
# 3. IPFS Setup
# 4. Backend API Deployment
# 5. Web Dashboard Deployment
# 6. Mobile App Release
# 7. Monitoring and Maintenance
# 8. Security Considerations
#
# ============================================================================
# 1. PREREQUISITES
# ============================================================================
#
# Required Accounts:
# - Alchemy or Infura (for blockchain RPC)
# - Pinata or web3.storage (for IPFS)
# - Fly.io or Railway (for backend API)
# - Vercel (for web dashboard)
# - Expo EAS (for mobile app builds)
# - Apple Developer (for iOS)
# - Google Play Console (for Android)
#
# Required Tools:
# - Node.js 18+
# - pnpm 8+
# - Hardhat
# - Expo CLI
# - Fly.io CLI
# - Vercel CLI
#
# Environment Variables:
# - Create .env files for each app (see .env.example)
# - Store secrets securely (use secret managers)
#
# ============================================================================
# 2. SMART CONTRACT DEPLOYMENT
# ============================================================================
#
# Network Selection:
# - Testnet: Polygon Mumbai (recommended for testing)
# - Mainnet: Polygon PoS or Base (low gas fees)
#
# Steps:
# 1. Configure hardhat.config.ts with network RPC URLs
# 2. Fund deployer wallet with MATIC/ETH
# 3. Run deployment script:
#    cd packages/contracts
#    pnpm run deploy:mumbai  # or deploy:polygon for mainnet
# 4. Save contract addresses from deployments/{network}.json
# 5. Verify contracts on block explorer:
#    pnpm run verify --network mumbai
# 6. Grant ISSUER_ROLE to issuer backend address
#    npx hardhat run scripts/grant-role.ts --network mumbai
#
# ============================================================================
# 3. IPFS SETUP
# ============================================================================
#
# Option A: Pinata (Recommended for simplicity)
# 1. Create Pinata account: https://pinata.cloud
# 2. Generate API keys
# 3. Set PINATA_API_KEY and PINATA_SECRET_KEY in issuer .env
#
# Option B: web3.storage (Free, decentralized)
# 1. Create account: https://web3.storage
# 2. Generate API token
# 3. Set WEB3_STORAGE_TOKEN in issuer .env
#
# Option C: Self-hosted IPFS cluster
# 1. Deploy IPFS node using docker-compose:
#    cd infra/docker/ipfs-cluster
#    docker-compose up -d
# 2. Configure issuer to use local IPFS API
#
# ============================================================================
# 4. BACKEND API DEPLOYMENT (Fly.io)
# ============================================================================
#
# Steps:
# 1. Install Fly.io CLI: https://fly.io/docs/hands-on/install-flyctl/
# 2. Login: flyctl auth login
# 3. Create app:
#    cd apps/issuer
#    flyctl launch --name pandoras-vault-issuer --region sjc
# 4. Provision PostgreSQL:
#    flyctl postgres create --name pandoras-vault-db --region sjc
#    flyctl postgres attach pandoras-vault-db
# 5. Set secrets:
#    flyctl secrets set ISSUER_PRIVATE_KEY=0x...
#    flyctl secrets set PINATA_API_KEY=...
#    flyctl secrets set PINATA_SECRET_KEY=...
#    flyctl secrets set BLOCKCHAIN_RPC_URL=https://...
#    flyctl secrets set AWS_ACCESS_KEY_ID=...  # if using AWS liveness
#    flyctl secrets set AWS_SECRET_ACCESS_KEY=...
# 6. Deploy:
#    flyctl deploy
# 7. Run migrations:
#    flyctl ssh console -C "npx prisma migrate deploy"
# 8. Test health endpoint:
#    curl https://pandoras-vault-issuer.fly.dev/health
#
# Alternative: Railway
# - Connect GitHub repo to Railway
# - Select apps/issuer as root directory
# - Add PostgreSQL plugin
# - Set environment variables
# - Deploy automatically on push
#
# ============================================================================
# 5. WEB DASHBOARD DEPLOYMENT (Vercel)
# ============================================================================
#
# Steps:
# 1. Install Vercel CLI: npm i -g vercel
# 2. Login: vercel login
# 3. Deploy:
#    cd apps/web
#    vercel --prod
# 4. Set environment variables in Vercel dashboard:
#    - NEXT_PUBLIC_ISSUER_API_URL=https://pandoras-vault-issuer.fly.dev
#    - NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/...
#    - NEXT_PUBLIC_CHAIN_ID=137
#    - NEXT_PUBLIC_DID_REGISTRY_ADDRESS=0x...
#    - NEXT_PUBLIC_VC_CATALOG_ADDRESS=0x...
#    - PINATA_API_KEY=...
#    - WEB3_STORAGE_TOKEN=...
# 5. Configure custom domain (optional):
#    - Add domain in Vercel dashboard
#    - Update DNS records
#
# Alternative: Deploy to AWS/GCP using Docker
# - Build Next.js static export: next build && next export
# - Upload to S3/Cloud Storage
# - Configure CloudFront/Cloud CDN
#
# ============================================================================
# 6. MOBILE APP RELEASE
# ============================================================================
#
# iOS Release:
# 1. Configure EAS:
#    cd apps/mobile
#    eas build:configure
# 2. Build for App Store:
#    eas build --platform ios --profile production
# 3. Submit to App Store:
#    eas submit --platform ios
# 4. Complete App Store Connect listing
# 5. Submit for review
#
# Android Release:
# 1. Build for Play Store:
#    eas build --platform android --profile production
# 2. Submit to Play Store:
#    eas submit --platform android
# 3. Complete Play Console listing
# 4. Submit for review
#
# Environment variables (set in eas.json):
# - EXPO_PUBLIC_ISSUER_API_URL
# - EXPO_PUBLIC_BLOCKCHAIN_RPC_URL
# - EXPO_PUBLIC_CHAIN_ID
#
# ============================================================================
# 7. MONITORING AND MAINTENANCE
# ============================================================================
#
# Backend Monitoring:
# - Fly.io metrics dashboard
# - Setup Sentry for error tracking
# - Configure log aggregation (Papertrail, Logtail)
# - Uptime monitoring (UptimeRobot, Pingdom)
#
# Blockchain Monitoring:
# - Setup Tenderly for contract monitoring
# - Alert on failed transactions
# - Monitor gas usage
#
# IPFS Monitoring:
# - Check pin status regularly
# - Monitor Pinata usage/quotas
# - Backup CIDs to database
#
# Database Backups:
# - Fly.io Postgres: automatic backups enabled
# - Manual backups: flyctl postgres backup create
#
# ============================================================================
# 8. SECURITY CONSIDERATIONS
# ============================================================================
#
# API Security:
# - Rate limiting enabled (see rateLimit.ts)
# - CORS restricted to known origins
# - HTTPS only (enforced by Fly.io/Vercel)
# - Input validation on all endpoints
# - API key authentication (optional)
#
# Blockchain Security:
# - Issuer private key stored in secure secrets manager
# - Multi-sig wallet for contract ownership (recommended)
# - Regular security audits of smart contracts
# - Implement emergency pause function
#
# Data Privacy:
# - Aadhaar numbers hashed before storage
# - VCs encrypted before IPFS upload (optional)
# - Minimal PII retention
# - GDPR/data protection compliance
#
# Mobile App Security:
# - Secure storage for private keys (expo-secure-store)
# - Biometric authentication
# - Certificate pinning for API calls
# - Code obfuscation for production builds
#
# Regular Updates:
# - Dependency updates (npm audit, pnpm audit)
# - Security patches for libraries
# - OS updates for servers
# - Smart contract upgrades (if using proxy pattern)
#
# ============================================================================
# ROLLBACK PROCEDURES
# ============================================================================
#
# Backend Rollback:
# - Fly.io: flyctl releases list
# - flyctl releases rollback <version>
#
# Web Rollback:
# - Vercel: Select previous deployment in dashboard
# - Promote to production
#
# Smart Contract:
# - Use proxy pattern (UUPS or Transparent) for upgradeability
# - Emergency pause function to halt operations
#
# ============================================================================
# COST ESTIMATION
# ============================================================================
#
# Monthly Costs (estimated):
# - Fly.io (issuer backend): $5-20 (1 instance, 512MB RAM)
# - Fly.io Postgres: $15-30 (small instance)
# - Vercel (web): $0-20 (Pro plan for custom domain)
# - Pinata: $0-20 (free tier: 1GB, paid for more)
# - Alchemy: $0-49 (free tier sufficient for testing)
# - AWS Rekognition: Pay per image ($0.001 per image)
# - Expo EAS: $99/month (for app builds)
#
# Total: ~$150-250/month
#
# ============================================================================
# CONTACT & SUPPORT
# ============================================================================
#
# Documentation: See docs/ folder
# Issues: GitHub Issues
# Community: Discord/Telegram (if available)
