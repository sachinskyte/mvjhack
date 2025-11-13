# Pandora's Vault

> Zero-custody verifiable credential wallet for Aadhaar-based digital identity

## Overview

Pandora's Vault is a decentralized identity system that enables users to:
- Apply for Aadhaar-based verifiable credentials
- Store credentials securely on their device (zero-custody)
- Share credentials selectively with verifiers
- Maintain complete control over their digital identity

## Architecture

This is a **monorepo** containing:

### Apps
- **mobile/** - React Native (Expo) mobile wallet for iOS & Android
- **web/** - Next.js web dashboard for credential management
- **issuer/** - Node.js + Fastify backend API for VC issuance

### Packages
- **contracts/** - Solidity smart contracts (Hardhat + Foundry)
- **shared/** - Shared TypeScript types and utilities
- **ipfs-pinning/** - IPFS pinning service abstraction

### Infrastructure
- **infra/** - Docker, Terraform, Kubernetes configurations
- **scripts/** - Deployment and automation scripts
- **.github/workflows/** - CI/CD pipelines

## Tech Stack

- **Frontend**: React Native (Expo), Next.js, TypeScript
- **Backend**: Node.js, Fastify, Prisma, PostgreSQL
- **Blockchain**: Polygon/Base, Hardhat, ethers.js
- **Identity**: Veramo (W3C DID/VC), did:ethr
- **Storage**: IPFS (Pinata/web3.storage), Arweave
- **Deployment**: Fly.io, Vercel, Expo EAS

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker (for local IPFS)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/pandoras-vault.git
cd pandoras-vault

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Run all apps in dev mode
pnpm dev

# Run specific app
pnpm --filter mobile dev
pnpm --filter web dev
pnpm --filter issuer dev

# Run smart contract tests
pnpm --filter contracts test
```

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
```

## Documentation

- [Production Deployment Guide](docs/PRODUCTION.md)
- [Zero-Custody Architecture](docs/ZERO_CUSTODY_FLOW.md)
- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## Project Structure

```
pandoras-vault/
├── apps/
│   ├── mobile/          # React Native mobile wallet
│   ├── web/             # Next.js web dashboard
│   └── issuer/          # Backend API
├── packages/
│   ├── contracts/       # Smart contracts
│   ├── shared/          # Shared code
│   └── ipfs-pinning/    # IPFS utilities
├── infra/               # Infrastructure configs
├── scripts/             # Deployment scripts
└── docs/                # Documentation
```

## Key Features

✅ **Zero-Custody**: Users own their credentials  
✅ **Privacy-Preserving**: Selective disclosure, minimal PII  
✅ **Decentralized**: IPFS storage, blockchain verification  
✅ **Self-Sovereign**: User-controlled DIDs  
✅ **Interoperable**: W3C VC/VP standards  
✅ **Secure**: Encrypted storage, liveness detection  

## License

MIT

## Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## Support

- Documentation: https://docs.pandoras-vault.example.com
- Issues: https://github.com/your-org/pandoras-vault/issues
- Discord: https://discord.gg/pandoras-vault
